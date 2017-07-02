import styled from "styled-components";

export const ItemTitle = styled.div`
  width: 5rem;
  align-content: right;
  display: flex;
  justify-content: flex-end;
`;

export const Container = styled.div`
  display: flex;
  justify-content: center;
  min-height: 250px;
`;

export const SubContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 600px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
`;

export const Row = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: row;
`;

export const RowContent = styled.div`
  display: flex;
`;

export const Input = styled.input`
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #4a4a4a;
  margin-left: 20px;
  width: 370px;
  font-size: 1.2rem;
`;

export const SubmitButton = styled.input`
  background-color: #7ed321;
  border: none;
  outline: none;
  padding: 15px 45px;
  :hover {
    cursor: pointer;
    background-color: #a4e063;
  }
  :active {
    background-color: #71bd1d;
  }
  :disabled {
    background-color: #c4c4c4;
  }
`;

export const Title = styled.div`
  font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;
  font-size: 2rem;
  font-weight: 200;
  color: #4a4a4a;
`;
