export const COMMIT_HEIGHT = 50;

export const WIDTH = 600; // We will be generating many of these, so let's keep our chart small

export const COMMIT_STYLING = {
  // NOTE: Histograms are easier to read when they are wider than they are tall
  width: WIDTH,
  height: WIDTH * 0.9,
  padding: {
    top: 0.1,
    right: 0.3,
    bottom: 0.1,
    left: 0.5,
  },
  //   margin: {
  //     top: 50,
  //     right: 15,
  //     bottom: 15,
  //     left: 10,
  //   },
};
