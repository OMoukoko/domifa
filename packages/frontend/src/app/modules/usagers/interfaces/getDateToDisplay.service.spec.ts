import { usagerValideMock } from "./../../../../_common/mocks/usager.mock";
import { getDateToDisplay } from "./getDateToDisplay.service";

it("getDateToDisplay: Valide", () => {
  expect(getDateToDisplay(usagerValideMock).isActif).toEqual(true);

  usagerValideMock.decision.statut = "REFUS";
  expect(getDateToDisplay(usagerValideMock).isActif).toEqual(false);

  usagerValideMock.decision.statut = "RADIE";
  expect(getDateToDisplay(usagerValideMock).isActif).toEqual(false);
});
