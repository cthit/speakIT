import React from "react";
import FontAwesome from "react-fontawesome";
import styled from "styled-components";

const RemoveUserButton = () => {
  return <TrashIcon name="trash" onClick={() => console.log("hello")} />;
};

export default RemoveUserButton;

const TrashIcon = styled(FontAwesome)`
  position: absolute;
  right: 20px;
  :hover {
    color: orange;
  }
  :active {
    color: purple;
  }
`;
