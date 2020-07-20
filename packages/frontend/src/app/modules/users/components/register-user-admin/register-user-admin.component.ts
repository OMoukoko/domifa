import { Component, Input, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { fadeInOut } from "../../../../shared/animations";
import { regexp } from "../../../../shared/validators";
import { User } from "../../interfaces/user";

import { UsersService } from "../../services/users.service";
import { Structure } from "src/app/modules/structures/structure.interface";
import { StructureService } from "src/app/modules/structures/services/structure.service";
import { Title } from "@angular/platform-browser";

@Component({
  animations: [fadeInOut],
  selector: "app-register-user",
  styleUrls: ["./register-user-admin.component.css"],
  templateUrl: "./register-user-admin.component.html",
})
export class RegisterUserAdminComponent implements OnInit {
  public user: User;
  public userForm: FormGroup;

  public submitted: boolean;
  public success: boolean;

  public emailExist: boolean = false;

  @Input() public structureChild!: {
    etapeInscription: number;
    structureId: number;
    structure: Structure;
  };

  get f() {
    return this.userForm.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService,
    private route: ActivatedRoute,
    private structureService: StructureService,
    private notifService: ToastrService,
    private titleService: Title
  ) {
    this.user = new User({});
    this.user.nom = "chips";
    this.user.role = "admin";
    this.user.prenom = "coca";
    this.user.email = "coca@test.fr";
    this.submitted = false;
    this.success = false;
  }

  public ngOnInit() {
    this.titleService.setTitle("Inscription sur Domifa");
    this.user.structureId =
      this.structureChild !== undefined
        ? this.structureChild.structureId
        : (this.user.structureId = parseInt(this.route.snapshot.params.id, 10));

    this.userForm = this.formBuilder.group({
      email: [
        this.user.email,
        [Validators.pattern(regexp.email), Validators.required],
        this.validateEmailNotTaken.bind(this),
      ],
      nom: [this.user.nom, Validators.required],
      role: [this.user.role, Validators.required],
      prenom: [this.user.prenom, Validators.required],
    });
  }

  public submitUser() {
    this.submitted = true;
    if (this.userForm.invalid) {
      this.notifService.error(
        "Veuillez vérifier les champs marqués en rouge dans le formulaire",
        "Erreur dans le formulaire"
      );
    } else {
      this.userService.registerUser(this.userForm.value).subscribe(
        (retour: boolean) => {
          this.success = true;
          this.notifService.success(
            "Votre compte a été créé avec succès",
            "Féliciations !"
          );
        },
        () => {
          this.notifService.error(
            "veuillez vérifier les champs marqués en rouge dans le formulaire",
            "Erreur dans le formulaire"
          );
        }
      );
    }
  }

  public validateEmailNotTaken(control: AbstractControl) {
    const testEmail = RegExp(regexp.email).test(control.value);
    return testEmail
      ? this.userService.validateEmail(control.value).pipe(
          map((res: boolean) => {
            return res === false ? null : { emailTaken: true };
          })
        )
      : of(null);
  }
}