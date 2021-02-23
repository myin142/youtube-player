import { InputBase, withStyles } from '@material-ui/core';

const InputField = withStyles((theme) => ({
  root: {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    padding: '0.5em 1em',
    borderRadius: '.5em',
    width: '100%',
  },
  input: {
    padding: 0,
  },
}))(InputBase);

export default InputField;
