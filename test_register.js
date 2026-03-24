const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:5000/api/users/register', {
      name: "Test User",
      email: "test" + Date.now() + "@test.com",
      password: "password123",
      role: "worker",
      birthDate: "01.01.2000",
      city: "Istanbul",
      region: "Kadikoy"
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("ERROR DATA:", err.response?.data);
  }
}
testRegister();
