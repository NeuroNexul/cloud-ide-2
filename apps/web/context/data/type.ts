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

export type Data = {
  explorer: {
    root: Root;
  };
  editor: {
    tabs: Array<
      {
        isActive: boolean;
        data: string;
      } & File
    >;
    setTabs: React.Dispatch<
      React.SetStateAction<
        ({
          isActive: boolean;
          data: string;
        } & File)[]
      >
    >;
  };
};
