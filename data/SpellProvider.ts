import { Spell } from "../structs/Spell";
import { SpellID } from "../structs/SpellID";

export default class SpellProvider {
  public static getClasses(): string[] {
    return [];
  }

  public static getSchools(): string[] {
    return [];
  }

  public static getLevels(): string[] {
    return [];
  }

  public static getSpellById(): Spell {
    return null;
  }

  public static getSpellIDsByFilters(
    classes: string[],
    schools: string[],
    levels: string[]
  ): SpellID[] {
    return [];
  }
}
