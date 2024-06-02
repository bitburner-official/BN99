import React from "react";
import { Container, Typography } from "@mui/material";

import { styled } from "@mui/system";
import { factory, factorySize } from "../Helper";
import { useRerender } from "../../ui/React/hooks";
import { EntityIcon, cellSize } from "./EntityIcon";

const CellD = styled("div")({
  width: cellSize + "px",
  height: cellSize + "px",
  backgroundColor: "#444",
  padding: 0,
  margin: "2px",
  marginTop: "4px",
  marginBottom: "4px",
});

const Cell = ({ x, y }: { x: number; y: number }): React.ReactElement => {
  const entity = factory.entities.find((e) => e.x === x && e.y === y);
  return <CellD>{entity && <EntityIcon entity={entity} />}</CellD>;
};

const RowD = styled("div")({
  padding: 0,
  margin: 0,
});

interface IColProps {
  x: number;
}

const Col = ({ x }: IColProps): React.ReactElement => {
  return (
    <RowD>
      {new Array(factorySize).fill(null).map((_, y) => (
        <Cell key={y} x={x} y={y}></Cell>
      ))}
    </RowD>
  );
};

const Table = styled("div")({
  border: "1px solid #fff",
  borderSpacing: "2px",
  overflow: "hidden",
  display: "flex",
  flexDirection: "row",
  paddingLeft: "2px",
  paddingRight: "2px",
});

interface IProps {}

export const FactoryRoot = (__props: IProps): React.ReactElement => {
  useRerender(200);
  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">Factory</Typography>
      <div style={{ display: "flex" }}>
        <Table>
          {new Array(factorySize).fill(null).map((_, index) => (
            <Col key={index} x={index} />
          ))}
        </Table>
      </div>
    </Container>
  );
};
