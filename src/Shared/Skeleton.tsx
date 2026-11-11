import styled, { keyframes } from "styled-components";

const pulse = keyframes`50% { opacity: 0.45; }`;
export const Skeleton = styled.span`
  display: block;
  min-height: 14px;
  border-radius: 8px;
  background: var(--soft);
  animation: ${pulse} 1.5s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Progress = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: 50%;
  animation: ${keyframes`to { transform: rotate(360deg); }`} 0.7s linear infinite;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
