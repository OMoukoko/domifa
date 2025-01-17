import { Component, Input, NgZone, OnInit } from "@angular/core";
import { MatomoTracker } from "ngx-matomo";
import { ToastrService } from "ngx-toastr";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { InteractionType } from "../../../../../_common/model/interaction";
import {
  UsagerFormModel,
  Interaction,
} from "../../../usager-shared/interfaces";
import { InteractionService } from "../../../usager-shared/services/interaction.service";

@Component({
  selector: "app-profil-historique-courriers",
  templateUrl: "./profil-historique-courriers.component.html",
  styleUrls: ["./profil-historique-courriers.component.css"],
})
export class ProfilHistoriqueCourriersComponent implements OnInit {
  @Input() public usager: UsagerFormModel;
  @Input() public me: UserStructure;

  public typeInteraction: InteractionType;
  public interactions: Interaction[];

  constructor(
    private notifService: ToastrService,
    private matomo: MatomoTracker,
    private interactionService: InteractionService,
    private ngZone: NgZone
  ) {}

  public ngOnInit(): void {
    this.interactions = [];
    this.getInteractions();
  }

  public deleteInteraction(interactionUuid: string) {
    this.matomo.trackEvent("profil", "interactions", "delete", 1);
    this.interactionService.delete(this.usager.ref, interactionUuid).subscribe({
      next: (usager: UsagerLight) => {
        this.usager = new UsagerFormModel(usager);
        this.notifService.success("Interaction supprimée avec succès");
        this.getInteractions();
      },
      error: () => {
        this.notifService.error("Impossible de supprimer l'interaction");
      },
    });
  }

  private getInteractions() {
    this.interactionService
      .getInteractions({
        usagerRef: this.usager.ref,
      })
      .subscribe((interactions: Interaction[]) => {
        this.interactions = interactions;
      });
  }
}
