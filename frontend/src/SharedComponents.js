import styled from "styled-components";

export const ItemTitle = styled.div`
  align-content: right;
  display: flex;
  justify-content: flex-start;
  font-size: 1.5em;
  margin-bottom: 0.2em;
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
  flex-direction: column;
  margin: 1em;
`;

export const Input = styled.input`
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #4a4a4a;
  min-width: 270px;
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
  margin-top: 1em;
  opacity: ${props => (props.inactive ? "0.6" : "1.0")};
  transform: ${props => (props.inactive ? "scale(0.95)" : "scale(1.0)")};
  margin-right: ${props => (props.inactive ? "-2em" : "0em")};
  margin-left: ${props => (props.inactive ? "2em" : "0em")};
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
  justify-content: space-around;
  @media (min-width: 900px) {
    flex-direction: row;
  }
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
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
  padding-top: 1.5em;
  padding-left: 1em;
`;

export const ListBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1em;
`;

export const HR = styled.hr`
  width: 18em;
  border: none;
  border-top: 1px solid #979797;
`;

export const ToolBarButton = styled.div`
  cursor: ${props => (props.inactive ? "" : "pointer")};
  background-color: ${props => (props.inactive ? "#d8d8d8" : "#f5f5f5")};
  :hover {
    background-color: ${props => (props.inactive ? "#d8d8d8" : "#e5e5e5")};
  }
  :active {
    background-color: ${props => (props.inactive ? "#d8d8d8" : "#d5d5d5")};
  }
`;
