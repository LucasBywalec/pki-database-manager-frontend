import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom';

export default function SignIn() {
  const [data, setData] = useState({ email: '', password: ''});

  const BASE_PATH = "http://localhost:3000";

  function isValidData() {
    return data.email.includes('@') && data.password !== '';
  }

  function handleDataChange(event, key) {
    setData({ ...data, [key]: event.target.value });
  }

  function handleSubmit() {
    if (!isValidData()) {
      window.alert('Please provide valid data.');
      return;
    }
    axios.post(`${BASE_PATH}/login`, {
      data: data
    })
      .then((response) => {
        if (response.status === 200) {
          window.location.href = "/main"
        } else {
          window.alert('Login failed. Please try again.');
        }
      })
      .catch((error) => {
        window.alert('Login failed. Please try again.\n' + error);
      });
  }

  return (
    <Box sx={{ width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ backgroundColor: "transparent", width: "30%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5em", marginTop: '15em'}}>
        <TextField
          margin='normal'
          label="Email"
          variant="outlined"
          fullWidth
          id="email"
          inputProps={{ maxLength: 150 }}
          onChange={(event) => { handleDataChange(event, 'email') }}
        />
        <TextField
          margin='normal'
          label="Password"
          variant="outlined"
          fullWidth
          type="password"
          id="password1"
          onChange={(event) => { handleDataChange(event, 'password') }}
        />
        <Button size="large" color="primary" variant='contained' onClick={handleSubmit}>
          Submit
        </Button>
        <Link to="/" style={{ textDecoration: 'none', marginTop: '1em' }}>
          <Button size="large" color="secondary" variant='outlined'>
            Sign Up
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
