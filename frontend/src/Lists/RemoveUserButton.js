import React from "react";
import FontAwesome from "react-fontawesome";
import styled from "styled-components";
import { adminDeleteUserFromList } from "../actions";

const RemoveUserButton = ({ speakerName, listId }) => {
  return (
    <TrashIcon
      name="trash"
      onClick={() => adminDeleteUserFromList(speakerName, listId)}
    />
  );
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
