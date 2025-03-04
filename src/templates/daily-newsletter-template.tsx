import * as React from "react";

interface DailyNewsletterProps {
  date: string;
  title: string;
  readings: string[];
  saint: {
    name: string;
    link: string;
    resume: string;
    image?: string;
  };
  reflection?: string;
  affiliates?: Array<{
    link: string;
    title: string;
    author: string | null;
  }>;
}

const DailyNewsletterTemplate: React.FC<DailyNewsletterProps> = ({
  title = "Liturgia Católica Diária",
  date = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  readings = [],
  saint = { name: "", link: "", resume: "", image: null },
  reflection = null,
  affiliates = [],
}) => {
  return (
    <div>
      <table
        cellPadding="0"
        cellSpacing="0"
        width="100%"
        style={{
          fontFamily: "Arial, sans-serif",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
        }}
      >
        <tbody>
          {/* Header */}
          <tr>
            <td
              align="center"
              style={{ padding: "40px 0", backgroundColor: "#FFF7ED" }}
            >
              <table cellPadding="0" cellSpacing="0" width="80%">
                <tbody>
                  <tr>
                    <td align="center">
                      <div style={{ marginBottom: "20px" }}>
                        <img
                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%2392400E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v20M5 12h14'/%3E%3C/svg%3E"
                          alt=""
                          width="32"
                          height="32"
                          style={{ display: "block", margin: "0 auto" }}
                        />
                      </div>
                      <h1
                        style={{
                          color: "#78350F",
                          fontSize: "24px",
                          margin: "0 0 10px 0",
                          fontFamily: "Georgia, serif",
                        }}
                      >
                        Liturgia Católica Diária
                      </h1>
                      <h2
                        style={{
                          color: "#92400E",
                        }}
                      >
                        {title}
                      </h2>
                      <p
                        style={{
                          color: "#92400E",
                          fontSize: "16px",
                          margin: "0",
                        }}
                      >
                        {date}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Daily Readings */}
          <tr>
            <td style={{ padding: "40px 30px", backgroundColor: "#ffffff" }}>
              <table cellPadding="0" cellSpacing="0" width="100%">
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: "20px" }}>
                      <table cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                          <tr>
                            <td width="24" style={{ paddingRight: "10px" }}>
                              <img
                                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2392400E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20'/%3E%3C/svg%3E"
                                alt=""
                                width="24"
                                height="24"
                              />
                            </td>
                            <td>
                              <h2
                                style={{
                                  color: "#78350F",
                                  fontSize: "20px",
                                  margin: "0",
                                  fontFamily: "Georgia, serif",
                                }}
                              >
                                Leituras do Dia
                              </h2>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        borderTop: "2px solid #FED7AA",
                        paddingTop: "20px",
                      }}
                    >
                      {readings && readings.length > 0 ? (
                        readings.map((reading, index) => (
                          <div key={index} style={{ marginBottom: "30px" }}>
                            <div
                              style={{
                                color: "#1F2937",
                                fontSize: "16px",
                                lineHeight: "1.6",
                              }}
                              dangerouslySetInnerHTML={{ __html: reading }}
                            />
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "#78350F", fontSize: "16px" }}>
                          Não há leituras disponíveis para hoje.
                        </p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Gospel Reflection */}
          {reflection && (
            <tr>
              <td
                style={{
                  padding: "0 30px 40px 30px",
                  backgroundColor: "#ffffff",
                }}
              >
                <table cellPadding="0" cellSpacing="0" width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <table cellPadding="0" cellSpacing="0" width="100%">
                          <tbody>
                            <tr>
                              <td style={{ paddingBottom: "20px" }}>
                                <table
                                  cellPadding="0"
                                  cellSpacing="0"
                                  width="100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        width="24"
                                        style={{ paddingRight: "10px" }}
                                      >
                                        <img
                                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='%2392400E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2v20M5 12h14'/%3E%3C/svg%3E"
                                          alt=""
                                          width="32"
                                          height="32"
                                          style={{
                                            display: "block",
                                            margin: "0 auto",
                                          }}
                                        />
                                      </td>
                                      <td>
                                        <h2
                                          style={{
                                            color: "#78350F",
                                            fontSize: "20px",
                                            margin: "0",
                                            fontFamily: "Georgia, serif",
                                          }}
                                        >
                                          Reflexão do Evangelho
                                        </h2>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: "20px",
                                  backgroundColor: "#FFFBEB",
                                  borderRadius: "6px",
                                  borderTop: "2px solid #FED7AA",
                                }}
                              >
                                <p
                                  style={{
                                    color: "#1F2937",
                                    fontSize: "16px",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  {reflection}
                                </p>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}

          {/* Saint of the Day */}
          {saint && saint.name && (
            <tr>
              <td
                style={{
                  padding: "0 30px 40px 30px",
                  backgroundColor: "#ffffff",
                }}
              >
                <table cellPadding="0" cellSpacing="0" width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <h2
                          style={{
                            color: "#78350F",
                            fontSize: "20px",
                            margin: "0 0 20px 0",
                            fontFamily: "Georgia, serif",
                            borderBottom: "2px solid #FED7AA",
                            paddingBottom: "10px",
                          }}
                        >
                          Santo do Dia
                        </h2>
                        <table cellPadding="0" cellSpacing="0" width="100%">
                          <tbody>
                            <tr>
                              <td
                                style={{
                                  padding: "20px",
                                  backgroundColor: "#FFFBEB",
                                  borderRadius: "6px",
                                }}
                              >
                                {saint.image && (
                                  <img
                                    src={saint.image || "/placeholder.svg"}
                                    alt={saint.name}
                                    style={{
                                      width: "120px",
                                      height: "120px",
                                      objectFit: "cover",
                                      borderRadius: "60px",
                                      margin: "0 auto 20px auto",
                                      display: "block",
                                    }}
                                  />
                                )}
                                <h3
                                  style={{
                                    color: "#92400E",
                                    fontSize: "18px",
                                    margin: "0 0 5px 0",
                                    textAlign: "center",
                                  }}
                                >
                                  {saint.name ||
                                    "Informação do santo não disponível"}
                                </h3>
                                <p
                                  style={{
                                    textAlign: "center",
                                    margin: "10px 0",
                                  }}
                                >
                                  <a
                                    href={saint.link}
                                    style={{
                                      color: "#92400E",
                                      textDecoration: "underline",
                                      fontSize: "14px",
                                    }}
                                  >
                                    Ler mais sobre {saint.name}
                                  </a>
                                </p>

                                <div
                                  style={{ textAlign: "justify" }}
                                  dangerouslySetInnerHTML={{
                                    __html: saint.resume,
                                  }}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}

          {/* Support Section */}
          {affiliates && (
            <tr>
              <td
                style={{
                  padding: "0 30px 40px 30px",
                  backgroundColor: "#ffffff",
                }}
              >
                <table cellPadding="0" cellSpacing="0" width="100%">
                  <tbody>
                    <tr>
                      <td>
                        <table cellPadding="0" cellSpacing="0" width="100%">
                          <tbody>
                            <tr>
                              <td style={{ paddingBottom: "20px" }}>
                                <table
                                  cellPadding="0"
                                  cellSpacing="0"
                                  width="100%"
                                >
                                  <tbody>
                                    <tr>
                                      <td
                                        width="24"
                                        style={{ paddingRight: "10px" }}
                                      >
                                        <img
                                          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2392400E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E"
                                          alt=""
                                          width="24"
                                          height="24"
                                        />
                                      </td>
                                      <td>
                                        <h2
                                          style={{
                                            color: "#78350F",
                                            fontSize: "20px",
                                            margin: "0",
                                            fontFamily: "Georgia, serif",
                                          }}
                                        >
                                          Apoie Nossa Missão
                                        </h2>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td
                                style={{
                                  padding: "20px",
                                  backgroundColor: "#FFFBEB",
                                  borderRadius: "6px",
                                  borderTop: "2px solid #FED7AA",
                                }}
                              >
                                <div style={{ marginBottom: "20px" }}>
                                  <p
                                    style={{
                                      color: "#1F2937",
                                      fontSize: "16px",
                                      lineHeight: "1.6",
                                      margin: "0 0 15px 0",
                                    }}
                                  >
                                    Ajude-nos a manter esta newsletter gratuita
                                    e alcançar mais pessoas
                                  </p>
                                  <p
                                    style={{
                                      color: "#666666",
                                      fontSize: "14px",
                                      margin: "0",
                                    }}
                                  >
                                    <a
                                      href="https://www.liturgianews.site/donate"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Clique aqui para conhecer a forma de
                                      doação
                                    </a>
                                  </p>
                                </div>

                                <div
                                  style={{
                                    borderTop: "1px solid #FED7AA",
                                    paddingTop: "20px",
                                  }}
                                >
                                  <p
                                    style={{
                                      color: "#78350F",
                                      fontSize: "16px",
                                      margin: "0 0 15px 0",
                                      fontWeight: "500",
                                    }}
                                  >
                                    Livros Recomendados:
                                  </p>
                                  <ul
                                    style={{
                                      listStyle: "none",
                                      padding: "0",
                                      margin: "0 0 15px 0",
                                    }}
                                  >
                                    {affiliates?.map((affiliate, index) => (
                                      <li
                                        key={index}
                                        style={{ marginBottom: "15px" }}
                                      >
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                          }}
                                        >
                                          <a
                                            href={affiliate.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              color: "#92400E",
                                              textDecoration: "underline",
                                              fontSize: "14px",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {affiliate.title}
                                            {affiliate.author &&
                                              " por " + affiliate.author}
                                          </a>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                  <p
                                    style={{
                                      margin: "20px 0 0 0",
                                      fontSize: "14px",
                                      color: "#666666",
                                    }}
                                  >
                                    <a
                                      href="https://amzn.to/41wJePa"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: "#92400E",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      Explore mais livros católicos →
                                    </a>
                                  </p>
                                  <p
                                    style={{
                                      color: "#666666",
                                      fontSize: "12px",
                                      margin: "15px 0 0 0",
                                      fontStyle: "italic",
                                    }}
                                  >
                                    *Links afiliados. Sua compra ajuda a manter
                                    nossa newsletter.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          )}

          {/* Share Section */}
          <tr>
            <td style={{ padding: "20px 30px", backgroundColor: "#ffffff" }}>
              <table cellPadding="0" cellSpacing="0" width="100%">
                <tbody>
                  <tr>
                    <td>
                      <table cellPadding="0" cellSpacing="0" width="100%">
                        <tbody>
                          <tr>
                            <td style={{ paddingBottom: "20px" }}>
                              <h2
                                style={{
                                  color: "#78350F",
                                  fontSize: "20px",
                                  margin: "0 0 15px 0",
                                  fontFamily: "Georgia, serif",
                                  textAlign: "center",
                                }}
                              >
                                Compartilhe esta newsletter
                              </h2>
                              <p
                                style={{
                                  color: "#92400E",
                                  fontSize: "16px",
                                  margin: "0 0 20px 0",
                                  textAlign: "center",
                                }}
                              >
                                Ajude-nos a espalhar a Palavra de Deus
                              </p>
                              <div style={{ textAlign: "center" }}>
                                <a
                                  href={`https://wa.me/?text=Estou%20compartilhando%20uma%20forma%20de%20ler%20a%20liturgia%20todos%20os%20dias%0ASe%20inscreve%20na%20liturgia%20diaria%20em%20https%3A%2F%2Fwww.liturgianews.site`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: "inline-block",
                                    backgroundColor: "#25D366",
                                    color: "#ffffff",
                                    padding: "8px 20px",
                                    borderRadius: "5px",
                                    textDecoration: "none",
                                    margin: "0 10px 10px 10px",
                                    fontSize: "14px",
                                  }}
                                >
                                  Compartilhar no WhatsApp
                                </a>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td
              style={{
                padding: "20px",
                backgroundColor: "#FFF7ED",
                borderTop: "1px solid #FED7AA",
              }}
            >
              <table cellPadding="0" cellSpacing="0" width="100%">
                <tbody>
                  <tr>
                    <td
                      align="center"
                      style={{ color: "#78350F", fontSize: "14px" }}
                    >
                      <p style={{ margin: "0 0 10px 0" }}>
                        &copy; 2025 Newsletter da Liturgia Católica Diária.
                        Todos os direitos reservados.
                      </p>
                      <p style={{ margin: "0 0 10px 0", fontSize: "12px" }}>
                        Você está recebendo este e-mail porque se inscreveu em
                        nossa newsletter.
                      </p>
                      <p style={{ margin: "0 0 10px 0", fontSize: "12px" }}>
                        <a
                          href="{{{RESEND_UNSUBSCRIBE_URL}}}"
                          style={{
                            color: "#92400E",
                            textDecoration: "underline",
                          }}
                        >
                          Clique aqui para cancelar sua inscrição
                        </a>
                      </p>
                      <p style={{ margin: "0 0 10px 0", fontSize: "12px" }}>
                        Créditos a Canção Nova por fornecer as leituras diárias.
                      </p>
                      <p style={{ margin: "0 0 10px 0", fontSize: "12px" }}>
                        Créditos a Catolicoapp pelas informações dos santos.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DailyNewsletterTemplate;
