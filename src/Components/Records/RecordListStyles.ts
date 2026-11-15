import styled from "styled-components";

export const Heading = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  h1 {
    font-size: 36px;
    margin: 6px 0;
  }
  p {
    font-size: 15px;
    color: var(--muted);
  }
  @media (max-width: 560px) {
    align-items: flex-start;
    flex-direction: column;
    h1 {
      font-size: 28px;
    }
  }
  a {
    min-width: 160px;
    min-height: 48px;
  }
`;
export const Panel = styled.section`
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--surface);
  overflow: hidden;
  .state {
    padding: 18px;
  }
`;
export const Table = styled.table<{ $tall: boolean }>`
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  th,
  td {
    text-align: start;
    padding: 0 18px;
    overflow-wrap: anywhere;
  }
  th {
    height: 46px;
    background: var(--soft);
    font-size: 13px;
  }
  td {
    height: ${({ $tall }) => ($tall ? 72 : 60)}px;
    font-size: 14px;
    border-block-end: 1px solid var(--line);
  }
  tr:last-child td {
    border: 0;
  }
  .mobile-label {
    display: none;
  }
  .actions .destructive {
    color: var(--error);
  }
  .actions button {
    min-width: 44px;
    min-height: 44px;
  }
  @media (max-width: 1100px) {
    display: block;
    colgroup,
    thead {
      display: none;
    }
    tbody {
      display: grid;
      gap: 12px;
      padding: 12px;
    }
    tr {
      display: block;
      padding: 8px 12px;
      border: 1px solid var(--line);
      border-radius: 10px;
    }
    td,
    tr:last-child td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      height: auto;
      min-height: 42px;
      padding: 6px 0;
      border: 0;
    }
    .mobile-label {
      display: inline;
      color: var(--muted);
      flex: none;
      font-size: 12px;
    }
  }
`;
export const DetailGrid = styled.dl`
  margin: 0;
  display: grid;
  gap: 0;
  & > div {
    display: grid;
    grid-template-columns: minmax(90px, 32%) minmax(0, 1fr);
    gap: 12px;
    padding: 12px 0;
    border-block-end: 1px solid var(--line);
  }
  & > div:last-child {
    border: 0;
  }
  dt {
    font-weight: 650;
    color: var(--muted);
  }
  dd {
    margin: 0;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  dd img {
    width: min(100%, 180px);
    height: 125px;
    object-fit: contain;
  }
`;
