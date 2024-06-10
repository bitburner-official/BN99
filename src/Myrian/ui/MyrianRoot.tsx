import React from "react";
import { Container, Typography } from "@mui/material";

import { styled } from "@mui/system";
import { myrian, myrianSize } from "../Helper";
import { useRerender } from "../../ui/React/hooks";
import { DeviceIcon, cellSize } from "./DeviceIcon";

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
  const device = myrian.devices.find((e) => e.x === x && e.y === y);
  return <CellD>{device && <DeviceIcon device={device} />}</CellD>;
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
      {new Array(myrianSize + 1).fill(null).map((_, y) => {
        if (y === 0)
          return (
            <CellD
              sx={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#00000000" }}
              key={y}
            >
              <Typography>{x - 1}</Typography>
            </CellD>
          );
        return <Cell key={y} x={x - 1} y={y - 1}></Cell>;
      })}
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

const YHeader = () => {
  return (
    <RowD>
      {new Array(myrianSize + 1).fill(null).map((_, y) => {
        return (
          <CellD
            sx={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#00000000" }}
            key={y}
          >
            <Typography>{y === 0 ? "Y\\X" : y - 1}</Typography>
          </CellD>
        );
      })}
    </RowD>
  );
};

interface IProps {}

export const MyrianRoot = (__props: IProps): React.ReactElement => {
  useRerender(50);
  return (
    <Container maxWidth="lg" disableGutters sx={{ mx: 0 }}>
      <Typography variant="h4">Myrian OS</Typography>
      <Typography>
        {myrian.vulns} vulns : {myrian.totalVulns} total vulns
      </Typography>
      <div style={{ display: "flex" }}>
        <Table>
          {new Array(myrianSize + 1).fill(null).map((_, x) => {
            if (x === 0) return <YHeader key={x} />;
            return <Col key={x} x={x} />;
          })}
        </Table>
      </div>
    </Container>
  );
};
