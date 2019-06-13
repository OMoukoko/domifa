import { Inject, Injectable, Logger } from '@nestjs/common';
import { Model } from "mongoose";
import { User } from '../../users/user.interface';
import { UsersService } from '../../users/users.service';
import { EntretienDto } from '../dto/entretien';
import { RdvDto } from '../dto/rdv';
import { SearchDto } from '../dto/search';
import { UsagersDto } from '../dto/usagers.dto';
import { Decision } from '../interfaces/decision';
import { Usager } from '../interfaces/usagers';

@Injectable()
export class UsagersService {

  public limit: number;
  public sort: {};
  public searchByName: {  };
  private readonly logger = new Logger(UsagersService.name);

  constructor(@Inject('USAGER_MODEL') private readonly usagerModel: Model<Usager>,
  private readonly usersService: UsersService) {

  }

  public async create(usagersDto: UsagersDto): Promise<Usager> {
    const createdUsager = new this.usagerModel(usagersDto);
    const user = await this.usersService.findById(2);
    createdUsager.etapeDemande++;
    createdUsager.decision.dateInstruction = new Date();
    createdUsager.decision.userInstructionName = user.prenom + ' ' + user.nom;
    createdUsager.decision.userInstructionId = 2;

    createdUsager.id = this.lastId(await this.findLastUsager());

    return createdUsager.save();
  }

  public async patch(usagersDto: UsagersDto): Promise<Usager> {
    usagersDto.etapeDemande++;
    return this.usagerModel.findOneAndUpdate({
      'id' : usagersDto.id
    }, {
      $set: usagersDto
    },{
      new: true
    }).select('-docsPath').exec();
  }

  public async updateUsager(usagerId: number, toUpdate: any) {
    return this.usagerModel.findOneAndUpdate({ 'id': usagerId }, {
      $set: toUpdate
    }, {
      new: true
    }).select('-docsPath').exec();
  }

  public async setDecision(usagerId: number, decision: Decision): Promise<Usager> {
    const user = await this.usersService.findById(2);
    const agent = user.prenom + ' ' + user.nom;

    if (decision.statut === 'demande') {
      decision.dateDemande = new Date();
      decision.userInstructionId = 2;
      decision.userInstructionName = agent;
      /* Mail au responsable */
    }

    if (decision.statut === 'valide' || decision.statut === 'refus' ) {
      decision.userDecisionId = 2;
      decision.userDecisionName = agent;
      decision.dateDebut = new Date();
      /* Récupération du dernier ID lié à la structure */
      /* SMS & Mail pr prévenir */

    }

    if (decision.statut === 'valide') {
      decision.dateFin = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    }

    return this.usagerModel.findOneAndUpdate({
      'id' :usagerId
    }, {
      $set: {
        "decision" : decision,
        "etapeDemande": 6,
      }
    },{
      new: true
    }).select('-docsPath').exec();
  }

  public async setEntretien(usagerId: number, entretien: EntretienDto): Promise<Usager> {
    return this.usagerModel.findOneAndUpdate({
      'id' :usagerId
    }, {
      $set: {
        "entretien" : entretien,
        "etapeDemande": 3,
      }
    },{
      new: true
    }).select('-docsPath').exec();
  }

  public async setRdv(usagerId: number, rdvDto: RdvDto, user: User): Promise<Usager> {
    /* GET USER NAME ID */
    return this.usagerModel.findOneAndUpdate({
      'id' : usagerId
    }, {
      $set: {
        "etapeDemande": 2,
        "rdv.dateRdv": rdvDto.dateRdv,
        "rdv.userId": rdvDto.userId,
        "rdv.userName": user.nom + ' ' + user.prenom,
      }
    },{
      new: true
    }).select('-docsPath').exec();
  }

  public async deleteDocument(usagerId: number, index): Promise<Usager> {
    const usager = await this.usagerModel.findOne({ "id": usagerId }).exec();
    const newDocs = usager.docs;
    const newDocsPath = usager.docsPath;
    newDocs.splice(parseInt(index, 2), 1);
    newDocsPath.splice(parseInt(index, 2), 1);

    /* GET USER NAME ID */
    return this.usagerModel.findOneAndUpdate({ 'id': usagerId }, {
      $set: {
        "docs": usager.docs,
        "docsPath": usager.docsPath
      }
    },{
      new: true
    }).exec();
  }

  public async addDocument(usagerId: number, filename: string, filetype: string, label: string): Promise<Usager> {
    const usager = await this.usagerModel.findOne({
      "id": usagerId
    }).exec();

    usager.docs.push({
      'createdAt': new Date(),
      'createdBy':  'Yassine',
      'filetype': filetype,
      'label': label,
    });

    usager.docsPath.push(filename);

    /* GET USER NAME ID */
    return this.usagerModel.findOneAndUpdate({ 'id' : usagerId }, {
      $set: {
        "docs": usager.docs,
        "docsPath": usager.docsPath
      }
    }, { new: true  })
    .select('-docsPath')
    .exec();
  }

  public async getDocument(usagerId: number, index: number): Promise<any> {
    const usager = await this.usagerModel.findOne({
      "id": usagerId
    }).exec();

    const fileInfos = usager.docs[index];
    fileInfos.path = usager.docsPath[index];
    return fileInfos;
  }

  public async findAll(): Promise<Usager[]> {
    return this.usagerModel.find().exec();
  }

  public async findById(usagerId: number): Promise<Usager> {
    return this.usagerModel.findOne({
      "id": usagerId
    }).select('-docsPath').exec();
  }

  public async deleteById(usagerId: number): Promise<any> {
    return this.usagerModel.deleteOne({
      "id": usagerId
    }).exec();
  }

  public async search(query?: SearchDto): Promise<Usager[]> {
    this.sort = { 'nom': 1 };

    /* ID DE LA STRUCTURE DE LUSER */
    interface SearchQuery {
      name?: string;
      $or?: any[];
      interactionType?: string;
      interactionStatut?: boolean;
      "decision.statut"?: {};
      "lastInteraction.nbre"?: {};
      structure?: string;
    }

    const searchQuery: SearchQuery = {};

    if (query.name) {
      searchQuery.$or =  [
        {
          nom: { $regex: '.*' + query.name + '.*', $options: '-i' }
        },
        {
          prenom: { $regex: '.*' + query.name + '.*', $options: '-i' }
        },
        {
          surnom: { $regex: '.*' + query.name + '.*', $options: '-i' }
        }
      ];
    }

    if (query.statut) {
      searchQuery["decision.statut"] = query.statut;
    }

    if (query.interactionType) {
      searchQuery["lastInteraction.nbCourrier"] = { $gt: 0 };
    }

    return this.usagerModel.find(searchQuery)
    .collation({locale: "en" })
    .sort(this.sort)
    .lean()
    .exec();
  }

  private async findLastUsager(): Promise<Usager> {
    return this.usagerModel.findOne().select('id').sort({ id: -1 }).limit(1).exec();
  }

  private lastId(usager: Usager): number{
    if (usager) {
      if (usager.id !== undefined) {
        return usager.id + 1;
      }
    }
    return 1;
  }
}
