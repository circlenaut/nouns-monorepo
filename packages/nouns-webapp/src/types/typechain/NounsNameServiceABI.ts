/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  OnEvent,
  PromiseOrValue,
  TypedEvent,
  TypedEventFilter,
  TypedListener,
} from "./common";

export interface NounsNameServiceABIInterface extends utils.Interface {
  functions: {
    "ens()": FunctionFragment;
    "nns()": FunctionFragment;
    "resolve(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic: "ens" | "nns" | "resolve"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "ens", values?: undefined): string;
  encodeFunctionData(functionFragment: "nns", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "resolve",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "ens", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nns", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "resolve", data: BytesLike): Result;

  events: {};
}

export interface NounsNameServiceABI extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: NounsNameServiceABIInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    ens(overrides?: CallOverrides): Promise<[string]>;

    nns(overrides?: CallOverrides): Promise<[string]>;

    resolve(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  ens(overrides?: CallOverrides): Promise<string>;

  nns(overrides?: CallOverrides): Promise<string>;

  resolve(
    addr: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    ens(overrides?: CallOverrides): Promise<string>;

    nns(overrides?: CallOverrides): Promise<string>;

    resolve(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    ens(overrides?: CallOverrides): Promise<BigNumber>;

    nns(overrides?: CallOverrides): Promise<BigNumber>;

    resolve(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ens(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nns(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    resolve(
      addr: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
