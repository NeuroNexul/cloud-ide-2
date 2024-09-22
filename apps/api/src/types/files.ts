export type Directory = {
  name: string;
  type: "dir";
  absolutePath: string;
  nodes: Array<File | Directory>;
};

export type File = {
  name: string;
  type: "file";
  absolutePath: string;
  extension: string;
};

export type Root = {
  name: string;
  type: "root";
  absolutePath: string;
  nodes: Array<File | Directory>;
};