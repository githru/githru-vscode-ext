interface MockData {
  message: string;
  dictionary: {
    [id: string]: {
      parentIds: string[];
    };
  };
  obj: Object;
}

export const getMockData = async (message: string) =>
  new Promise<MockData>((resolve) => {
    setTimeout(() => {
      console.log(message);
      resolve({
        message,
        dictionary: {
          first: {
            parentIds: [],
          },
          second: {
            parentIds: ["first"],
          },
          third: {
            parentIds: ["first", "second"],
          },
        },
        obj: {},
      });
    }, 30);
  });

export const getStringifiedMockData = async (message: string) => {
  const mockData = await getMockData(message);
  return JSON.stringify(mockData);
};
