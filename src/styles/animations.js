// filepath: /Users/ajdp/Documents/Coding Assessments/valr/valr-blockchain-explorer/src/styles/animations.js
import { keyframes, css } from 'styled-components';

/**
 * Animation keyframes that can be reused across components
 */
export const slideInFromLeft = keyframes`
  from { transform: translateX(-50px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

/**
 * Higher-order function to create sequenced animation styles
 * @param {Object} keyframeAnimation - The keyframe animation to apply
 * @param {Number} duration - Animation duration in seconds
 * @param {Number} index - The element's index in the sequence (0-based)
 * @param {Number} delayBetween - Delay between each item in seconds
 * @param {String} highlightColor - Optional background highlight color (with transparency)
 * @returns {Object} Styled-components CSS object
 */
export const createSequencedAnimation = (
  keyframeAnimation,
  duration = 0.5,
  index = 0,
  delayBetween = 0.3,
  highlightColor = null
) => css`
  animation: ${keyframeAnimation} ${duration}s ease-out;
  animation-fill-mode: forwards;
  animation-delay: ${index * delayBetween}s;
  opacity: 0;
  ${highlightColor ? `background-color: ${highlightColor};` : ''}
`;

/**
 * Calculate total animation duration for a group of items
 * @param {Number} itemCount - Number of items in the sequence
 * @param {Number} delayBetween - Delay between animations in seconds
 * @param {Number} duration - Base duration of each animation
 * @param {Number} buffer - Extra time buffer in seconds
 * @returns {Number} Total duration in milliseconds
 */
export const calculateAnimationDuration = (
  itemCount,
  delayBetween = 0.3,
  duration = 0.5,
  buffer = 0.5
) => {
  return (itemCount * delayBetween + duration + buffer) * 1000;
};