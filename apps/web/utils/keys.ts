import React from "react";

export const handleKeyUp = <T extends () => void>(
  event: React.KeyboardEvent<HTMLInputElement>,
  func: T
) => {
  // TODO: additional key events (as types)
  if (event.key === "Enter") {
    event.preventDefault();
    func();
  }
};
