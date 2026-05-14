import Navbar from "../components/Navbar";

function Home() {
  return (
    <div>
      <Navbar user={true} />

      <h1>Studora Dashboard</h1>

      <p>Welcome to Studora.</p>

      <p>Your student overview will appear here.</p>
    </div>
  );
}

export default Home;