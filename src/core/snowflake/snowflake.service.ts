import { Injectable } from '@nestjs/common'

@Injectable()
export class SnowflakeService {
  /**
   * Unique identifier of the server/worker generating IDs.
   *
   * Multiple application instances can generate IDs simultaneously.
   * The worker ID ensures that two different workers don't generate
   * the same ID at the same timestamp and sequence.
   *
   * With 10 bits:
   * 2^10 = 1024 possible workers
   * Worker IDs: 0 - 1023
   */
  private readonly workerId: bigint

  /**
   * Custom epoch from which timestamps are calculated.
   *
   * Instead of storing the complete Unix timestamp,
   * we store:
   *
   *     currentTimestamp - epoch
   *
   * This produces a smaller number and allows the timestamp
   * to fit within the allocated 41 bits.
   *
   * 1609459200000 = 2021-01-01 00:00:00 UTC
   */
  private readonly epoch = 1609459200000n

  /**
   * Number of bits allocated to the worker ID.
   *
   * 10 bits => 2^10 = 1024 workers
   */
  private readonly workerIdBits = 10n

  /**
   * Number of bits allocated to the sequence number.
   *
   * 12 bits => 2^12 = 4096 IDs per millisecond per worker.
   */
  private readonly sequenceBits = 12n

  /**
   * Maximum value that can be stored in 10 bits.
   *
   * 1111111111 (binary) = 1023
   */
  private readonly maxWorkerId = (1n << this.workerIdBits) - 1n

  /**
   * Maximum value that can be stored in 12 bits.
   *
   * 111111111111 (binary) = 4095
   *
   * Therefore, sequence values range from 0 to 4095,
   * giving us 4096 possible IDs within the same millisecond.
   */
  private readonly maxSequence = (1n << this.sequenceBits) - 1n

  /**
   * Number of positions the worker ID needs to be shifted.
   *
   * The sequence occupies the last 12 bits, so the worker ID
   * must be shifted left by 12 bits.
   *
   * ID layout:
   *
   *     Timestamp | Worker ID | Sequence
   *                <-- 10 -->  <-- 12 -->
   */
  private readonly workerIdShift = this.sequenceBits

  /**
   * Number of positions the timestamp needs to be shifted.
   *
   * Worker ID = 10 bits
   * Sequence  = 12 bits
   *
   * Therefore:
   *
   * Timestamp must be shifted by 10 + 12 = 22 bits.
   */
  private readonly timestampShift = this.sequenceBits + this.workerIdBits

  /**
   * Timestamp used to generate the previous ID.
   *
   * Used to detect clock rollback and determine whether
   * the current ID is being generated in the same millisecond.
   */
  private lastTimestamp = -1n

  /**
   * Number used to differentiate IDs generated within
   * the same millisecond by the same worker.
   *
   * Example:
   *
   * Timestamp = 1000
   *
   * ID 1 -> sequence 0
   * ID 2 -> sequence 1
   * ID 3 -> sequence 2
   */
  private sequence = 0n

  constructor() {
    /**
     * Read the worker ID from environment variables.
     *
     * Default worker ID is 0 if it isn't provided.
     */
    const workerId = Number(process.env.SNOWFLAKE_WORKER_ID ?? 0)

    /**
     * Validate the worker ID.
     *
     * Worker ID must:
     * 1. Be an integer
     * 2. Be >= 0
     * 3. Fit inside the allocated 10 bits
     *
     * Valid range:
     * 0 - 1023
     */
    if (
      !Number.isInteger(workerId) ||
      workerId < 0 ||
      BigInt(workerId) > this.maxWorkerId
    ) {
      throw new Error(
        `SNOWFLAKE_WORKER_ID must be between 0 and ${this.maxWorkerId}`,
      )
    }

    /**
     * Convert worker ID to bigint because all bitwise
     * operations in this implementation use bigint.
     */
    this.workerId = BigInt(workerId)
  }

  /**
   * Generates a unique Snowflake ID.
   *
   * ID structure:
   *
   * Timestamp: 41 bits
   * Worker ID: 10 bits
   * Sequence:  12 bits
   * 
   *
   * Total = 63 bits
   *
   * The remaining 1 bit is kept unused so that the resulting
   * ID remains positive when represented as a signed 64-bit integer.
   */
  generate(): bigint {
    /**
     * Get the current timestamp in milliseconds.
     */
    let currentTimestamp = this.currentTimestamp()

    /**
     * Detect system clock rollback.
     *
     * Example:
     *
     * Previous ID → timestamp 1000
     * Current time → timestamp 999
     *
     * If we continue generating IDs, timestamp-based uniqueness
     * can be compromised.
     *
     * Therefore, we stop ID generation.
     */
    if (currentTimestamp < this.lastTimestamp) {
      throw new Error(`Clock moved backwards. Refusing to generate ID.`)
    }

    /**
     * Check whether another ID is being generated
     * within the same millisecond.
     */
    if (currentTimestamp === this.lastTimestamp) {
      /**
       * Increment the sequence number.
       *
       * The '& maxSequence' operation keeps the sequence
       * within the allocated 12 bits.
       *
       * Example:
       *
       * 4095 + 1 = 4096
       *
       * 4096 cannot fit in 12 bits, so it wraps to 0.
       */
      this.sequence = (this.sequence + 1n) & this.maxSequence

      /**
       * Sequence overflow.
       *
       * We have already generated 4096 IDs during this
       * millisecond for this worker.
       *
       * We must wait until the next millisecond before
       * generating another ID.
       */
      if (this.sequence === 0n) {
        currentTimestamp = this.waitForNextMillisecond(this.lastTimestamp)
      }
    } else {
      /**
       * A new millisecond has started.
       *
       * We can reset the sequence because the timestamp
       * itself will differentiate the new IDs from the
       * previous millisecond.
       */
      this.sequence = 0n
    }

    /**
     * Store the timestamp used for this ID.
     *
     * It will be used by the next generate() call to:
     * 1. Detect clock rollback
     * 2. Determine whether we're in the same millisecond
     */
    this.lastTimestamp = currentTimestamp

    /**
     * Construct the final Snowflake ID.
     *
     * Step 1:
     *
     *     currentTimestamp - epoch
     *
     * Gives us the timestamp relative to our custom epoch.
     *
     * Step 2:
     *
     *     << timestampShift
     *
     * Moves the timestamp 22 bits to the left,
     * leaving space for:
     *
     *     Worker ID = 10 bits
     *     Sequence  = 12 bits
     *
     * Step 3:
     *
     *     workerId << workerIdShift
     *
     * Moves the worker ID 12 bits to the left,
     * leaving the last 12 bits for the sequence.
     *
     * Step 4:
     *
     *     |
     *
     * Bitwise OR combines all three components.
     *
     * Final layout:
     *
     *     Timestamp | Worker ID | Sequence
     *       41 bits    10 bits     12 bits
     */
    return (
      ((currentTimestamp - this.epoch) << this.timestampShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence
    )
  }

  /**
   * Returns the current Unix timestamp in milliseconds.
   *
   * Date.now() returns a JavaScript number.
   * We convert it to bigint because Snowflake IDs use
   * 64-bit integer arithmetic.
   */
  private currentTimestamp(): bigint {
    return BigInt(Date.now())
  }

  /**
   * Waits until the system clock moves to the next millisecond.
   *
   * This is called when all 4096 sequence values have already
   * been used within the current millisecond.
   */
  private waitForNextMillisecond(lastTimestamp: bigint): bigint {
    let timestamp = this.currentTimestamp()

    /**
     * Busy-wait until the clock advances.
     *
     * Example:
     *
     * lastTimestamp = 1000
     *
     * current = 1000 -> wait
     * current = 1000 -> wait
     * current = 1001 -> continue
     */
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp()
    }

    return timestamp
  }
}
