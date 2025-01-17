import { usagerRefusMock } from "../../../../_common/mocks/usagerRefus.mock";
import { USAGER_ACTIF_MOCK } from "../../../../_common/mocks/USAGER_ACTIF.mock";
import { generateMotifLabel } from "./generateMotifLabel.service";

describe("generateMotifLabel", () => {
  it("generateMotifLabel  ", async () => {
    expect(generateMotifLabel(USAGER_ACTIF_MOCK.decision)).toEqual("");

    usagerRefusMock.decision.motif = "HORS_AGREMENT";
    expect(generateMotifLabel(usagerRefusMock.decision)).toEqual(
      "En dehors des critères du public domicilié"
    );

    usagerRefusMock.decision.motif = "LIEN_COMMUNE";

    expect(generateMotifLabel(usagerRefusMock.decision)).toEqual(
      "Absence de lien avec la commune"
    );

    usagerRefusMock.decision.motif = "SATURATION";

    expect(generateMotifLabel(usagerRefusMock.decision)).toEqual(
      "Nombre maximal domiciliations atteint"
    );

    usagerRefusMock.decision.motif = "AUTRE";
    usagerRefusMock.decision.motifDetails =
      "Nombre maximal domiciliations atteint";

    expect(generateMotifLabel(usagerRefusMock.decision)).toEqual(
      "Autre motif : Nombre maximal domiciliations atteint"
    );

    usagerRefusMock.decision.motifDetails = null;

    expect(generateMotifLabel(usagerRefusMock.decision)).toEqual(
      "Autre motif non précisé"
    );
  });
});
