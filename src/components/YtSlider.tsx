import { Slider, withStyles } from '@material-ui/core';

const YtSlider = withStyles((theme) => ({
  root: {
    color: theme.palette.secondary.main,
    height: 4,
  },
  thumb: {
    height: 12,
    width: 12,
    backgroundColor: theme.palette.secondary.contrastText,
    border: '2px solid currentColor',
    marginTop: -4,
    marginLeft: -6,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 4,
    borderRadius: 4,
  },
  rail: {
    height: 4,
    borderRadius: 4,
  },
}))(Slider);

export default YtSlider;
