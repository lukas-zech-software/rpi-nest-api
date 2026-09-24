import { Controller, Get, Redirect } from '@nestjs/common';
import { Public } from '../authentication/authentication.guard';

/**
 * Handles redirection from root to api docs
 */
@Public()
@Controller('/')
export class OpenApiController {
  /**
   * GET Requests to API root will be redirected to the api docs
   */
  @Public()
  @Get('')
  @Redirect('/api-docs', 302)
  root() {
    // nothing to do here
  }
}
