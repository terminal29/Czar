export class Spell {
  name: string;
  id: string;
  source: string;

  formattedText: string;
  classes: string[];
  keywords: string[];
  level: string;
  school: string;
  time: string;
  duration: string;
  range: string;

  hasVerbalComponent: boolean;
  hasSomaticComponent: boolean;
  hasMaterialComponent: boolean;

  materialComponents?: string;

  isConcentration: boolean;
  isRitual: boolean;
}
