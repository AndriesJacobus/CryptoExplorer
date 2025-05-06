import React from 'react';
import styled from 'styled-components';

/**
 * Bitcoin block icon component 
 */
const BlockIcon = ({ size = 48 }) => {
  return (
    <IconContainer size={size}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        width={size} 
        height={size}
      >
        <circle cx="12" cy="12" r="12" fill="#F7931A"/>
        <path 
          d="M16.642 10.775c.216-1.44-.88-2.213-2.379-2.728l.486-1.952-1.187-.296-.474 1.9c-.312-.078-.632-.151-.95-.224l.477-1.911-1.187-.296-.486 1.952c-.258-.059-.512-.117-.758-.178v-.006l-1.638-.41-.316 1.269s.88.202.862.214c.48.12.567.438.553.69L8.293 12.9c.024.062.086.165.248.319l-.252-.063-.776 3.116c-.059.146-.208.366-.544.283.012.017-.862-.215-.862-.215l-.469 1.53 1.545.385c.287.072.569.147.845.218l-.49 1.968 1.186.296.487-1.954c.324.088.639.17.947.246l-.485 1.943 1.187.296.49-1.963c2.025.383 3.548.229 4.188-1.603.516-1.476-.026-2.328-1.09-2.884.776-.179 1.36-.689 1.517-1.744zM14.37 14.189c-.367 1.476-2.845.677-3.65.478l.651-2.613c.806.201 3.39.6 2.999 2.136zm.367-3.83c-.334 1.342-2.398.66-3.066.493l.59-2.369c.668.167 2.825.478 2.476 1.876z" 
          fill="white"
        />
      </svg>
    </IconContainer>
  );
};

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

export default BlockIcon;