import styled from "styled-components";

/** Gives the actions column consistent edge spacing and a single, non-wrapping row. */
export const ActionsCell = styled.td`
  padding-inline: 20px;
  white-space: nowrap;
  @media (max-width: 1100px) {
    padding-inline: 0;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
`;
