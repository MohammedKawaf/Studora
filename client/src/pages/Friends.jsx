import Navbar from "../components/Navbar";

function Friends() {
  return (
    <div>
      <Navbar user={true} />

      <main className="page">
        <section className="page-header">
          <h1>Friends</h1>
          <p>Find students, manage friend requests and view your friends.</p>
        </section>

        <section className="card">
          <h2>Search Students</h2>
          <p>Student search will be added here.</p>
        </section>

        <section className="card">
          <h2>Friend Requests</h2>
          <p>Incoming friend requests will be shown here.</p>
        </section>

        <section className="card">
          <h2>Your Friends</h2>
          <p>Your friend list will be shown here.</p>
        </section>
      </main>
    </div>
  );
}

export default Friends;