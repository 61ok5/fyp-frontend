import { Card, CardContent, Grid, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
// import Logo from './../../assets/images/brand.png';
import JWTLogin from './JWTLogin';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: '#f2f1ed',
    height: '100vh',
    minHeight: '100%',
  },
  backButton: {
    marginLeft: theme.spacing(2),
  },
  card: {
    overflow: 'visible',
    display: 'flex',
    position: 'relative',
    '& > *': {
      flexGrow: 1,
      flexBasis: '50%',
      width: '50%',
    },
    maxWidth: '475px',
    margin: '24px auto',
  },
  content: {
    padding: theme.spacing(5, 4, 3, 4),
  },
  forgot: {
    textDecoration: 'none',
    paddingLeft: '16px',
  },
  margin: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  logo: {
    display: 'block',
    width: '70%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  title: {
    color: theme.palette.text.hint,
  },
}));

const Login = () => {
  const classes = useStyles();

  return (
    <Grid container justifyContent="center" alignItems="center" className={classes.root}>
      <Grid item xs={11} sm={7} md={6} lg={4}>
        <Card className={classes.card}>
          <CardContent className={classes.content}>
            <Grid container direction="column" spacing={4} justifyContent="center">
              <Grid item xs={12}>
                <Typography variant="h3" align="center" className={classes.title}>
                  Login
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <JWTLogin />
              </Grid>
              <Grid item xs={12}>
                <Grid container justifyContent="center">
                  <Grid item>
                    <RouterLink to="/register">
                      If you don&apos;t have an account, click here to register one.
                    </RouterLink>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Login;
