const btn = document.querySelector(".btn");

const getResponse = async (message) => {
  try {
    const response = await fetch(`http://localhost:8000/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
      }),
    });
    const data = await response.json();

    return data.data.stats;
  } catch (err) {
    console.log(err);
  }
};

btn.addEventListener("click", async () => {
  const data = await getResponse("Saya kecewa dengan layanan customer service karena tidak mendapatkan solusi yang memuaskan.");
});
