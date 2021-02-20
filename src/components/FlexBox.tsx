import { Box, withStyles } from '@material-ui/core';

const FlexBox = withStyles({
  root: {
    display: 'flex',
    gap: '1em',
    alignItems: 'center',
    justifyContent: 'center',
  },
})(Box);

export default FlexBox;
