import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [data, setData] = useState({ email: '', password: '', lastname: '', firstname: '', repassword: '' });
  const BASE_PATH = "https://db-manager-9jaj.onrender.com";
  const navigate = useNavigate();

  const [registrationError, setRegistrationError] = useState(null);

  function isValidData() {
    return data.email.includes('@') && data.lastname !== '' && data.firstname !== '' && data.password !== '';
  }

  function handleDataChange(event, key) {
    setData({ ...data, [key]: event.target.value });
  }

  function handleSubmit() {
    if (!isValidData()) {
      console.log(data);
      window.alert('Please provide valid data.');
      return;
    }

    axios.post(`${BASE_PATH}/register`, {
        data: data,
      })
      .then((response) => {
        console.log('User registered successfully:', response.data);
        // window.location.href = "/signin"
        navigate('/signin');
        setRegistrationError(null);
      })
      .catch((error) => {
        console.error('Registration failed:', error);
        setRegistrationError('Registration failed. Please try again.');
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
        <TextField
          margin='normal'
          label="Confirm Password"
          variant="outlined"
          fullWidth
          type="password"
          id="password2"
          onChange={(event) => { handleDataChange(event, 'repassword') }}
        />
        <TextField
          margin='normal'
          label="Name"
          variant="outlined"
          fullWidth
          type="text"
          id="name"
          onChange={(event) => { handleDataChange(event, 'firstname') }}
        />
        <TextField
          margin='normal'
          label="Surname"
          variant="outlined"
          fullWidth
          type="text"
          id="surname"
          onChange={(event) => { handleDataChange(event, 'lastname') }}
        />
        {registrationError && (
          <div style={{ color: 'red', marginTop: '1em' }}>{registrationError}</div>
        )}
        <Button size="large" color="primary" variant='contained' onClick={handleSubmit}>
          Submit
        </Button>
        <Link to="/signin" style={{ textDecoration: 'none', marginTop: '1em' }}>
          <Button size="large" color="secondary" variant='outlined'>
            Sign In
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
