import React, { PropsWithChildren } from 'react';
import { IconButton, makeStyles, Tooltip } from '@material-ui/core';

interface IconToggleProps {
  active: boolean;
  onClick?: () => void;
  title?: string;
}

const useStyles = makeStyles((theme) => ({
  active: {
    color: theme.palette.secondary.main,
  },
}));

export default function IconToggle({
  children,
  active,
  onClick,
  title,
}: PropsWithChildren<IconToggleProps>) {
  const classes = useStyles();
  return (
    <Tooltip title={title || ''}>
      <IconButton className={active ? classes.active : ''} onClick={onClick}>
        {children}
      </IconButton>
    </Tooltip>
  );
}
