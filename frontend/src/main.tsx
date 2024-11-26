import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { UserProvider } from "./contexts/userContext.tsx";
import { ApolloClientProvider } from "./contexts/apolloClientContext.tsx";
import { EditionSectionsProvider } from "./contexts/editionContext.tsx";
import { ConfirmPopupProvider } from "./contexts/confirmPopupContext.tsx";
import { ChangeGroupProvider } from "./contexts/changeGroupContext.tsx";
import { OverrideGradeProvider } from "./contexts/overrideGradeContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloClientProvider>
      <UserProvider>
        <EditionSectionsProvider>
          <ConfirmPopupProvider>
            <ChangeGroupProvider>
              <OverrideGradeProvider>
                <App />
              </OverrideGradeProvider>
            </ChangeGroupProvider>
          </ConfirmPopupProvider>
        </EditionSectionsProvider>
      </UserProvider>
    </ApolloClientProvider>
  </React.StrictMode>,
);
