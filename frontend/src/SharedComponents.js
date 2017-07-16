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

export const RowContent = styled.div`display: flex;`;

export const Input = styled.input`
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #4a4a4a;
  margin-left: 20px;
  width: 370px;
  font-size: 1.2rem;
`;

export const Title = styled.div`
  font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-size: 2rem;
  font-weight: 200;
  color: #4a4a4a;
`;

export const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 20em;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  min-height: 18em;
`;

export const ListHeader = styled.div`
  background-color: #efeeee;
  display: flex;
  flex-direction: column;
`;

export const ListTitle = styled.div`
  font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-size: 2em;
  height: 2em;
  line-height: 2em;
  text-align: center;
  font-weight: bold;
  color: #4a4a4a;
`;

export const RowContainer = styled(Container)`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

export const ColumnContainer = styled(Container)`
  display: flex;
  flex-direction: column;
`;

export const SubListTitle = styled.div`
  font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-size: 1.25em;
  font-weight: bold;
  color: #4a4a4a;
  padding-top: 0.5em;
  padding-left: 1em;
`;

export const ListBody = styled.div`
  display: flex;
  flex-direction: column;
`;

export const HR = styled.hr`
  width: 18em;
  border: none;
  border-top: 1px solid #979797;
`;
