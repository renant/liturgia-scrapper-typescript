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
                        Leituras do Dia
                      </h2>
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
