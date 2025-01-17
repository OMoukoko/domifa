import { StatsPrivateController } from "../stats/controllers/stats.private.controller";
import { StatsPublicController } from "../stats/controllers/stats.public.controller";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersController } from "../usagers/controllers/usagers.controller";
import { CerfaService } from "../usagers/services/cerfa.service";
import { DocumentsService } from "../usagers/services/documents.service";
import { UsagersService } from "../usagers/services/usagers.service";
import { UsersModule } from "../users/users.module";
import { AppTestContext, AppTestHelper } from "../util/test";
import { API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS } from "./API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS.const";

// NOTE: pour n'exécuter que certains tests de sécurité, renseigner la variable d'environnement DOMIFA_FILTER_SEC_TEST, exemple:
//
// `DOMIFA_FILTER_SEC_TEST=Agenda ENV_FILE=tests-local npx jest -- app-controllers.anonymous.spec.ts`

const TEST_BASENAME = "Anonymous";

describe(`App controllers security - ${TEST_BASENAME}`, () => {
  let context: AppTestContext;

  beforeAll(async () => {
    context = await AppTestHelper.bootstrapTestApp(
      {
        controllers: [
          UsagersController,
          StatsPublicController,
          StatsPrivateController,
        ],
        imports: [UsersModule, StructuresModule, StatsModule],
        providers: [CerfaService, UsagersService, DocumentsService],
      },
      { initApp: true }
    );
  });

  afterAll(async () => {
    await AppTestHelper.tearDownTestApp(context);
  });

  for (const testDef of AppTestHelper.filterSecurityTests(
    API_SECURITY_STRUCTURE_CONTROLLER_TEST_DEFS
  )) {
    it(`[API SECURITY TEST][${TEST_BASENAME}] ${testDef.label}`, async () => {
      const { response, expectedStatus } = await testDef.query(context);

      expect(response.status).toBe(expectedStatus);
    });
  }
});
