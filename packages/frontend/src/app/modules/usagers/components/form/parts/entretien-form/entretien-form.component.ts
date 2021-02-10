import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { UsagerService } from "src/app/modules/usagers/services/usager.service";
import { AppUser, UsagerLight } from "../../../../../../../_common/model";

@Component({
  selector: "app-entretien-form",
  templateUrl: "./entretien-form.component.html",
})
export class EntretienFormComponent implements OnInit {
  public usager: UsagerLight;
  public me: AppUser;
  public isRdvNow = false;

  constructor(
    private usagerService: UsagerService,
    private notifService: ToastrService,
    private authService: AuthService,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.titleService.setTitle("Entretien avec l'usager");

    this.authService.currentUserSubject.subscribe((user: AppUser) => {
      this.me = user;
    });

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerService.findOne(id).subscribe(
        (usager: UsagerLight) => {
          this.usager = usager;
        },
        () => {
          this.router.navigate(["404"]);
        }
      );
    } else {
      this.router.navigate(["404"]);
    }
  }

  public getAttestation() {
    return this.usagerService.attestation(this.usager.ref);
  }

  public nextStep(step: number) {
    this.usagerService
      .nextStep(this.usager.ref, step)
      .subscribe((usager: UsagerLight) => {
        this.router.navigate(["usager/" + usager.ref + "/edit/documents"]);
      });
  }

  public rdvNow() {
    const rdvFormValue = {
      isNow: true,
      dateRdv: new Date(),
      userId: this.me.id.toString(),
    };

    this.usagerService.createRdv(rdvFormValue, this.usager.ref).subscribe(
      (usager: UsagerLight) => {
        this.usager = usager;
        this.isRdvNow = true;
      },
      () => {
        this.notifService.error(
          "Impossible de réaliser l'entretien maintenant"
        );
      }
    );
  }
}
