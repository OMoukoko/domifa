import { UsagerLight } from "../../../../../../../_common/model";
import { dataSorter, SortableAttribute } from "../../../../../../shared";
import { UsagersFilterCriteria } from "../UsagersFilterCriteria";

export const usagersSorter = {
  sortBy,
};

function sortBy(
  usagers: UsagerLight[],
  { sortKey, sortValue }: Pick<UsagersFilterCriteria, "sortKey" | "sortValue">
) {
  if (!sortKey) {
    return usagers;
  }
  return dataSorter.sortMultiple(usagers, {
    getSortAttributes: (usager) => {
      const sortAttributes: SortableAttribute[] = [];

      if (sortKey === "RADIE" || sortKey === "REFUS") {
        sortAttributes.push(
          {
            value: usager.decision?.dateFin,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom?.toLowerCase(),
          },
          {
            value: usager.prenom?.toLowerCase(),
          }
        );
      } else if (sortKey === "INSTRUCTION" || sortKey === "ATTENTE_DECISION") {
        sortAttributes.push(
          {
            value: usager.decision?.dateDecision,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom?.toLowerCase(),
          },
          {
            value: usager.prenom?.toLowerCase(),
          }
        );
      } else if (sortKey === "VALIDE" || sortKey === "TOUS") {
        sortAttributes.push(
          {
            value: usager.decision?.dateFin,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom?.toLowerCase(),
          },
          {
            value: usager.prenom?.toLowerCase(),
          }
        );
      } else if (sortKey === "PASSAGE") {
        sortAttributes.push(
          {
            value: usager.lastInteraction?.dateInteraction,
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom?.toLowerCase(),
          },
          {
            value: usager.prenom?.toLowerCase(),
          }
        );
      } else if (sortKey === "NAME") {
        sortAttributes.push(
          {
            value: usager.nom?.toLowerCase(),
            asc: sortValue !== "descending",
          },
          {
            value: usager.prenom?.toLowerCase(),
          }
        );
      } else if (sortKey === "ID") {
        sortAttributes.push(
          {
            value: parseAsNumberOrString(usager.customRef),
            asc: sortValue !== "descending",
          },
          {
            value: usager.nom?.toLowerCase(),
          },
          {
            value: usager.prenom?.toLowerCase(),
          }
        );
      }
      return sortAttributes;
    },
  });
}
function parseAsNumberOrString(customRef: string): any {
  if (/^\d+$/.test(customRef)) {
    const customRefAsNumber = parseInt(customRef, 10);
    return customRefAsNumber; // sort as number
  }
  return customRef; // sort as string
}
