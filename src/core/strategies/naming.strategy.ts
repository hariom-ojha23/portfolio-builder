import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm'
import { snakeCase } from 'typeorm/util/StringUtils'

export class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className)
  }

  columnName(propertyName: string, customName: string): string {
    return customName ? customName : snakeCase(propertyName)
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName)
  }
}
