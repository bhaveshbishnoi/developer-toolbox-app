export type RootStackParamList = {
    MainTabs: undefined;
    // Existing 10 tools
    JsonFormatter: { initialInput?: string } | undefined;
    Base64Encoder: { initialInput?: string } | undefined;
    JwtDecoder: { initialInput?: string } | undefined;
    RegexTester: { initialInput?: string } | undefined;
    ColorConverter: { initialInput?: string } | undefined;
    HashGenerator: { initialInput?: string } | undefined;
    ApiTester: { initialInput?: string } | undefined;
    UuidGenerator: { initialInput?: string } | undefined;
    TimestampConverter: { initialInput?: string } | undefined;
    UrlEncoder: { initialInput?: string } | undefined;

    // Six New Android Feature Modules
    DeviceInfo: undefined;
    SensorTester: { initialSensor?: string } | undefined;
    NetworkAnalyzer: undefined;
    QrToolkit: undefined;
    HardwareTester: { initialTest?: string } | undefined;
    AppInspector: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    DeviceHub: undefined;
    Favorites: undefined;
    History: undefined;
    Settings: undefined;
};
