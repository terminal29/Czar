export class SpellList {
  constructor(id: string, name: string, thumbnailURI?: string) {
    this.id = id;
    this.name = name;
    this.thumbnailURI = thumbnailURI;
  }
  id: string;
  name: string;
  thumbnailURI: string;
}
