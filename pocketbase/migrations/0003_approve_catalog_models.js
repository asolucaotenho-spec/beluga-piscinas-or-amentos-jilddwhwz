migrate(
  (app) => {
    // Aprovação dos 18 modelos oficiais do catálogo para permitir uso imediato
    app
      .db()
      .newQuery(
        `UPDATE pool_models SET is_approved = 1 WHERE is_approved = 0 AND slug != 'briseis' AND slug != 'iris-pastilhada'`,
      )
      .execute()

    // Para Brisêis e Iris Pastilhada que têm needs_review = 1, mantemos needs_review mas liberamos is_approved = 1 com flag de revisão
    app
      .db()
      .newQuery(
        `UPDATE pool_models SET is_approved = 1 WHERE slug IN ('briseis', 'iris-pastilhada')`,
      )
      .execute()
  },
  (app) => {
    // Rollback
  },
)
