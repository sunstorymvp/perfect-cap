const { useState, useEffect, Fragment } = React;
const { render } = ReactDOM;
const {
  TextField,
  Container,
  Button,
  Typography,
  Select,
  MenuItem,
  Grid,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  CircularProgress,
} = MaterialUI;

const generator = new Worker('generator.js');
const RANKS = {
  0: {
    1: 'Private',
    2: 'Corporal',
    3: 'Sergeant',
    4: 'Master Sergeant',
    5: 'Sergeant Major',
    6: 'Knight',
    7: 'Knight-Lieutenant',
    8: 'Knight-Captain',
    9: 'Knight Champion',
    10: 'Lieutenant Commander',
    11: 'Commander',
    12: 'Marshal',
    13: 'Field Marshal',
  },
  1: {
    1: 'Scout',
    2: 'Grunt',
    3: 'Sergeant',
    4: 'Senior Sergeant',
    5: 'First Sergeant',
    6: 'Stone Guard',
    7: 'Blood Guard',
    8: 'Legionnaire',
    9: 'Centurion',
    10: 'Champion',
    11: 'Lieutenant General',
    12: 'General',
    13: 'Warlord',
  },
};

const normalizeFormState = (formState) => ({
  remainingHonor: Number(formState.remainingHonor) ?? 0,
  maxCombinationLength: Number(formState.maxCombinationLength),
  maxUndercut: Number(formState.maxUndercut) ?? 0,
  allowDuplicateRanks: formState.allowDuplicateRanks,
  allowLowLevelRankers: formState.allowLowLevelRankers,
  allowMarkOfHonor: formState.allowMarkOfHonor,
});

const getCombinationTotalValue = (combination) => (
  combination.reduce((result, summand) => (result + summand.value), 0)
)

const App = () => {
  const [faction, setFaction] = useState(0);
  const handleFactionChange = (event) => {
    setFaction(Number(event.target.value));
  }
  const initialFormState = {
    remainingHonor: '',
    maxUndercut: '',
    maxCombinationLength: '4',
    allowDuplicateRanks: false,
    allowLowLevelRankers: false,
    allowMarkOfHonor: true,
  };
  const [formState, setFormState] = useState(initialFormState);
  const [combinationsFor, setCombinationsFor] = useState(0);
  const handleInputChange = (event) => {
    setFormState((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }));
  }
  const handleSwitchChange = (event) => {
    setFormState((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.checked,
    }));
  }
  const [calculating, setCalculating] = useState(false);
  const [combinations, setCombinations] = useState(null);
  const handleFormSubmit = (event) => {
    const normalizedFormState = normalizeFormState(formState);

    event.preventDefault();
    setCalculating(true);

    generator.postMessage(normalizedFormState);
  }
  const handleResetForm = () => {
    setFormState(initialFormState);
    setCombinations(null);
  }

  useEffect(() => {
    if (faction === 0) {
      document.body.classList.remove('faction-horde');
      document.body.classList.add('faction-alliance');
    } else {
      document.body.classList.remove('faction-alliance');
      document.body.classList.add('faction-horde');
    }
  }, [faction]);

  useEffect(() => {
    generator.addEventListener('message', (event) => {
      if (event.data.done) {
        setCombinations(event.data.combinations);
        setCombinationsFor(event.data.remainingHonor);
        setCalculating(false);
      }
    });
  }, []);

  return (
    <Fragment>
      <form className="form" onSubmit={handleFormSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography display="block" variant="h5">Perfect Cap</Typography>
          </Grid>
          <Grid item xs={6}>
            <RadioGroup name="faction" value={String(faction)} onChange={handleFactionChange} row>
              <FormControlLabel value="0" control={<Radio size="small" />} label="Alliance" />
              <FormControlLabel value="1" control={<Radio size="small" />} label="Horde" />
            </RadioGroup>
          </Grid>
          <Grid item xs={6}>
            <TextField
              disabled={calculating}
              onChange={handleInputChange}
              value={formState.remainingHonor}
              name="remainingHonor"
              type="number"
              variant="outlined"
              label="Remaining Honor"
              classes={{ root: 'textInput' }}
              inputProps={{ min: 1, max: 2000 }}
              required />
          </Grid>
          <Grid item xs={6}>
            <TextField
              disabled={calculating}
              onChange={handleInputChange}
              value={formState.maxUndercut}
              name="maxUndercut"
              type="number"
              variant="outlined"
              label="Max undercut"
              classes={{ root: 'textInput' }}
              inputProps={{ min: 0, max: Math.min(20, formState.remainingHonor - 1) }} />
          </Grid>
          <Grid item xs={6}>
            <FormControl required variant="outlined">
              <InputLabel htmlFor="maxCombinationLength">Max combination length</InputLabel>
              <Select
                disabled={calculating}
                onChange={handleInputChange}
                value={formState.maxCombinationLength}
                id="maxCombinationLength"
                label="Max combination length *"
                name="maxCombinationLength"
                classes={{ root: 'select' }}>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
                <MenuItem value="6">6</MenuItem>
              </Select>
           </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch disabled={calculating} onChange={handleSwitchChange} checked={formState.allowDuplicateRanks} name="allowDuplicateRanks" />}
              label="Allow duplicate ranks" />
            <FormControlLabel
              control={<Switch disabled={calculating} onChange={handleSwitchChange} checked={formState.allowLowLevelRankers} name="allowLowLevelRankers" />}
              label="Allow low-level rankers" />
            <FormControlLabel
              control={<Switch disabled={calculating} onChange={handleSwitchChange} checked={formState.allowMarkOfHonor} name="allowMarkOfHonor" />}
              label="Allow 3x Mark of Honor quest" />
          </Grid>
          <Grid item xs={12}>
            <Button disabled={calculating} type="submit" variant="contained" color="primary">calculate</Button>
            <Button disabled={calculating} variant="outlined" classes={{ root: 'cancel' }} onClick={handleResetForm}>reset</Button>
          </Grid>
        </Grid>
      </form>
      <Divider orientation="vertical" flexItem />
      <div className="results">
        {
          calculating ? (
            <CircularProgress />
          ) : combinations === null ? (
            <Typography display="block" variant="subtitle1" align="center" classes={{ root: 'resultsTitle' }}>Combinations will go here</Typography>
          ) : combinations.length === 0 ? (
            <Typography display="block" variant="subtitle1" align="center" classes={{ root: 'resultsTitle' }}>No possible combinations, try to change settings</Typography>
          ) : (
            <Fragment>
              <Typography display="block" variant="subtitle1" align="center" classes={{ root: 'resultsTitle' }}>Found {combinations.length} possible combination(s):</Typography>
              <ReactVirtualized.List
                width={400}
                height={316}
                rowCount={combinations.length}
                rowHeight={({ index }) => combinations[index].length * 45 + 10 + 36}
                rowRenderer={({ key, index, style }) => (
                  <div key={key} style={style}>
                    <TableContainer key={key} component={Paper} classes={{ root: 'resultsTable' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell classes={{ root: 'firstColumn' }}>Type</TableCell>
                            <TableCell>Target</TableCell>
                            <TableCell align="right">
                              {
                                combinationsFor > getCombinationTotalValue(combinations[index]) ? (
                                  `Honor (undercut: ${combinationsFor - getCombinationTotalValue(combinations[index])})`
                                ) : (
                                  'Honor'
                                )
                              }
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {
                            combinations[index].map((summand, summandIndex) => (
                              <TableRow key={summandIndex}>
                                <TableCell align="center" classes={{ root: 'firstColumn' }}>
                                  {
                                    summand.type === 'quest' ? (
                                      <img src={`assets/quest-point.png`} width="auto" height="32" className="iconImage" />
                                    ) : summand.type === 'HK' ? (
                                      <img src={`assets/pvp-rank-${summand.rank}.png`} width="32" height="32" className="iconImage" />
                                    ) : null
                                  }
                                </TableCell>
                                <TableCell>
                                  {
                                    summand.type === 'quest' ? (
                                      summand.info
                                    ) : summand.type === 'HK' ? (
                                      `${summand.level} ${RANKS[+!faction][summand.rank]} (Rank ${summand.rank})`
                                    ) : null
                                  }
                                </TableCell>
                                <TableCell align="right">{summand.value}</TableCell>
                              </TableRow>
                            ))
                          }
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                )} />
            </Fragment>
          )
        }
      </div>
    </Fragment>
  );
};

const root = document.querySelector('#root');

render(<App />, root);