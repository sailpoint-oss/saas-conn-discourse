import { Config } from "../model/config";
import { AxiosWrapper } from "./axios-wrapper";
import { AxiosWrapper as AxiosMock } from "./__mocks__/axios-wrapper"
import { HTTP } from "./http";

export class HTTPFactory {
  static getHTTP(config: Config): HTTP {
    if (config.apiUsername === 'test') {
      return new AxiosMock(config)
    } else {
      return new AxiosWrapper(config)
    }
  }
}