import React from 'react';

import classes from './ModalTextPrimary.module.css';

interface ModalTextPrimaryProps {
  children?: React.ReactNode;
}

export const ModalTextPrimary = ({ children }: ModalTextPrimaryProps) => 
  <div className={classes.text}>{children}</div>;

export default ModalTextPrimary