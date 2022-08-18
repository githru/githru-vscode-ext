import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";
import App from "./App";

test("renders Welcome to githru as a text", () => {
  render(<App />);
  const linkElement = screen.getByText(/Welcome to githru./i);
  expect(linkElement).toBeInTheDocument();
});
