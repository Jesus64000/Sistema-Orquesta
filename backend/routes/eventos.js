// ✅ Obtener todos los eventos futuros
router.get("/futuros", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id_evento, titulo, descripcion, fecha_evento, lugar, hora_evento
       FROM evento
       WHERE fecha_evento >= CURDATE()
       ORDER BY fecha_evento ASC, hora_evento ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo eventos futuros:", err);
    res.status(500).json({ error: "Error obteniendo eventos futuros" });
  }
});
